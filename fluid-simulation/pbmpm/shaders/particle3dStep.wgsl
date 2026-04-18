//-----------------------------------------------------------------------------
// Copyright (c) 2024 Electronic Arts.  All rights reserved.
//-----------------------------------------------------------------------------

//!insert SimEnums
//!insert DispatchSizes
//!insert Sim3DConstants
//!insert SimShape3D

struct Particle3D
{
    positionRadius: vec4f,
    velocitySpeed: vec4f,
    restPositionDensity: vec4f,
    particleState: vec4f,
};

@group(0) @binding(0) var<uniform> g_constants : Sim3DConstants;
@group(0) @binding(1) var<storage> g_shapes : array<SimShape3D>;
@group(0) @binding(2) var<storage> g_particlesIn : array<Particle3D>;
@group(0) @binding(3) var<storage, read_write> g_particlesOut : array<Particle3D>;

struct MaterialProps
{
    stiffness: f32,
    cohesion: f32,
    velocityBlend: f32,
    drag: f32,
    homeStrength: f32,
    targetDensity: f32,
    densityResponse: f32,
    tensionResponse: f32,
    viscosityResponse: f32,
    frictionResponse: f32,
    bondRadiusScale: f32,
    bondResponse: f32,
    bondVelocityResponse: f32,
};

struct CollisionResolve
{
    position: vec3f,
    normal: vec3f,
    collided: bool,
};

fn getMaterialProps(material: f32) -> MaterialProps
{
    if(material == MaterialElastic)
    {
        return MaterialProps(1.05, 0.03, 0.045, 0.04, 2.05, 7.1, 0.18, 0.03, 0.18, 0.08, 2.14, 0.32, 0.08);
    }

    if(material == MaterialSand)
    {
        return MaterialProps(1.15, 0.0, 0.01, 0.09, 0.0, 5.2, 0.26, 0.0, 0.08, 0.44, 1.08, 0.0, 0.0);
    }

    if(material == MaterialVisco)
    {
        return MaterialProps(0.8, 0.055, 0.18, 0.08, 0.34, 7.4, 0.2, 0.06, 0.58, 0.18, 2.24, 0.2, 0.24);
    }

    return MaterialProps(0.82, 0.03, 0.14, 0.018, 0.0, 6.4, 0.24, 0.08, 0.72, 0.04, 1.92, 0.06, 0.09);
}

fn getRelaxationScale(material: f32) -> f32
{
    if(material == MaterialLiquid)
    {
        return 0.45 + g_constants.liquidRelaxation * 0.4;
    }

    if(material == MaterialElastic)
    {
        return 0.38 + g_constants.elasticRelaxation * 0.34;
    }

    if(material == MaterialSand)
    {
        return 0.28 + g_constants.elasticRelaxation * 0.26;
    }

    return 0.3 + (g_constants.liquidRelaxation * 0.18 + g_constants.plasticity * 0.82);
}

fn getShapeRetentionScale() -> f32
{
    return 0.4 + g_constants.elasticRelaxation * 0.42 + g_constants.plasticity * 0.18;
}

fn getCohesionScale(material: f32) -> f32
{
    if(material == MaterialLiquid)
    {
        return 0.9 + g_constants.liquidRelaxation * 0.14;
    }

    if(material == MaterialElastic)
    {
        return 0.75 + g_constants.elasticRelaxation * 0.12;
    }

    if(material == MaterialVisco)
    {
        return 0.82 + g_constants.plasticity * 0.24 + g_constants.liquidViscosity * 0.18;
    }

    return 1.0;
}

fn getBondResponseScale(material: f32) -> f32
{
    if(material == MaterialLiquid)
    {
        return 0.72 + g_constants.liquidRelaxation * 0.12;
    }

    if(material == MaterialElastic)
    {
        return 0.64 + g_constants.elasticRelaxation * 0.18;
    }

    if(material == MaterialVisco)
    {
        return 0.58 + g_constants.plasticity * 0.22 + g_constants.liquidViscosity * 0.16;
    }

    return 1.0;
}

fn getBondRadiusScale(material: f32, props: MaterialProps) -> f32
{
    if(material == MaterialLiquid)
    {
        return props.bondRadiusScale + g_constants.liquidRelaxation * 0.05;
    }

    if(material == MaterialElastic)
    {
        return props.bondRadiusScale + g_constants.elasticRelaxation * 0.04;
    }

    if(material == MaterialVisco)
    {
        return props.bondRadiusScale + g_constants.plasticity * 0.06 + g_constants.liquidViscosity * 0.04;
    }

    return props.bondRadiusScale;
}

fn getGravityAcceleration() -> f32
{
    let sceneHeight = max(1.0, max(48.0, f32(g_constants.gridSize.y) - 24.0) - 24.0);
    return sceneHeight * g_constants.gravityStrength;
}

fn getDragScale(drag: f32) -> f32
{
    return pow(max(0.001, 1.0 - drag), max(g_constants.deltaTime * 60.0, 0.0));
}

fn clampBounds(position: vec3f, radius: f32) -> vec3f
{
    let minBounds = vec3f(24.0, 24.0, 4.0) + vec3f(radius);
    let maxBounds = vec3f(
        max(48.0, f32(g_constants.gridSize.x) - 24.0),
        max(48.0, f32(g_constants.gridSize.y) - 24.0),
        max(8.0, f32(g_constants.gridSize.z) - 4.0)
    ) - vec3f(radius);

    return clamp(position, minBounds, maxBounds);
}

fn insideSphere(position: vec3f, center: vec3f, radius: f32) -> bool
{
    return length(position - center) <= radius;
}

fn insideBox(position: vec3f, center: vec3f, halfSize: vec3f) -> bool
{
    let local = position - center;
    return abs(local.x) <= halfSize.x
        && abs(local.y) <= halfSize.y
        && abs(local.z) <= halfSize.z;
}

fn solveSphereCollision(position: vec3f, radius: f32, shape: SimShape3D) -> CollisionResolve
{
    let center = shape.position;
    let combinedRadius = shape.radius + radius;
    let delta = position - center;
    let distance = length(delta);
    if(distance >= combinedRadius || combinedRadius <= 0.0)
    {
        return CollisionResolve(position, vec3f(0.0), false);
    }

    let direction = select(vec3f(0.0, 1.0, 0.0), delta / max(distance, 1e-5), distance > 1e-5);
    return CollisionResolve(center + direction * combinedRadius, direction, true);
}

fn solveBoxCollision(position: vec3f, radius: f32, shape: SimShape3D) -> CollisionResolve
{
    let center = shape.position;
    let halfSize = shape.halfSize;
    let local = position - center;

    if(abs(local.x) > halfSize.x + radius
        || abs(local.y) > halfSize.y + radius
        || abs(local.z) > halfSize.z + radius)
    {
        return CollisionResolve(position, vec3f(0.0), false);
    }

    let overlapX = halfSize.x + radius - abs(local.x);
    let overlapY = halfSize.y + radius - abs(local.y);
    let overlapZ = halfSize.z + radius - abs(local.z);

    var corrected = position;
    var normal = vec3f(0.0);
    if(overlapX <= overlapY && overlapX <= overlapZ)
    {
        let directionX = sign(select(1.0, local.x, abs(local.x) > 1e-5));
        corrected.x = center.x + directionX * (halfSize.x + radius);
        normal = vec3f(directionX, 0.0, 0.0);
    }
    else if(overlapY <= overlapZ)
    {
        let directionY = sign(select(1.0, local.y, abs(local.y) > 1e-5));
        corrected.y = center.y + directionY * (halfSize.y + radius);
        normal = vec3f(0.0, directionY, 0.0);
    }
    else
    {
        let directionZ = sign(select(1.0, local.z, abs(local.z) > 1e-5));
        corrected.z = center.z + directionZ * (halfSize.z + radius);
        normal = vec3f(0.0, 0.0, directionZ);
    }

    return CollisionResolve(corrected, normal, true);
}

fn applyContactVelocityResponse(velocity: vec3f, contactNormal: vec3f, borderFriction: f32) -> vec3f
{
    let normalLength = length(contactNormal);
    if(normalLength <= 1e-5)
    {
        return velocity;
    }

    let normal = contactNormal / normalLength;
    let normalVelocity = dot(velocity, normal);
    if(normalVelocity >= 0.0)
    {
        return velocity;
    }

    let tangentialVelocity = velocity - normal * normalVelocity;
    let tangentialScale = clamp(1.0 - borderFriction, 0.0, 1.0);
    return tangentialVelocity * tangentialScale;
}

@compute @workgroup_size(ParticleDispatchSize, 1, 1)
fn csMain(@builtin(global_invocation_id) id : vec3u)
{
    let particleIndex = id.x;
    if(particleIndex >= g_constants.particleCount)
    {
        return;
    }

    let particle = g_particlesIn[particleIndex];
    if(particle.particleState.y < 0.5)
    {
        g_particlesOut[particleIndex] = particle;
        return;
    }

    let radius = particle.positionRadius.w;
    let restPosition = particle.restPositionDensity.xyz;
    let material = particle.particleState.x;
    let props = getMaterialProps(material);

    var position = particle.positionRadius.xyz;
    var velocity = particle.velocitySpeed.xyz;
    let previousPosition = position;

    velocity += vec3f(0.0, getGravityAcceleration(), 0.0) * g_constants.deltaTime;
    velocity *= getDragScale(props.drag);

    if(props.homeStrength > 0.0)
    {
        velocity += (restPosition - position) * props.homeStrength * getShapeRetentionScale() * g_constants.elasticityRatio * g_constants.deltaTime;
    }

    position += velocity * g_constants.deltaTime;

    var density = 0.0;
    var centroid = vec3f(0.0);
    var neighbourVelocity = vec3f(0.0);
    var bondWeight = 0.0;
    var bondCentroid = vec3f(0.0);
    var bondVelocity = vec3f(0.0);
    if(g_constants.particleCount > 1u)
    {
        let interactionSampleCount = min(max(1u, g_constants.interactionSampleCount), g_constants.particleCount - 1u);
        let interactionStride = max(1u, g_constants.interactionStride);
        var processed = 0u;
        var otherIndex = (particleIndex + interactionStride) % g_constants.particleCount;

        loop
        {
            if(processed >= interactionSampleCount)
            {
                break;
            }

            if(otherIndex != particleIndex)
            {
                let other = g_particlesIn[otherIndex];
                if(other.particleState.y >= 0.5)
                {
                    let delta = other.positionRadius.xyz - position;
                    let distance = length(delta);
                    let direction = select(vec3f(0.0, 1.0, 0.0), delta / max(distance, 1e-5), distance > 1e-5);
                    let combinedRadius = radius + other.positionRadius.w;
                    let minDistance = combinedRadius * 0.92;
                    let interactionDistance = combinedRadius * 1.65;

                    if(distance < interactionDistance)
                    {
                        let otherProps = getMaterialProps(other.particleState.x);
                        let interactionWeight = 1.0 - distance / interactionDistance;
                        density += interactionWeight;
                        centroid += other.positionRadius.xyz * interactionWeight;
                        neighbourVelocity += other.velocitySpeed.xyz * interactionWeight;

                        let bondDistance = combinedRadius * 0.5 * (getBondRadiusScale(material, props) + getBondRadiusScale(other.particleState.x, otherProps));
                        if(distance < bondDistance)
                        {
                            let materialAffinity = select(0.18, 1.0, abs(other.particleState.x - material) < 0.5);
                            let bondInfluence = (1.0 - distance / bondDistance) * materialAffinity;
                            bondWeight += bondInfluence;
                            bondCentroid += other.positionRadius.xyz * bondInfluence;
                            bondVelocity += other.velocitySpeed.xyz * bondInfluence;
                        }

                        if(distance < minDistance)
                        {
                            let overlap = minDistance - distance;
                            let stiffness = 0.5 * (props.stiffness + otherProps.stiffness);
                            position -= direction * overlap * 0.5 * stiffness;
                        }
                        else
                        {
                            let cohesion = 0.5 * (props.cohesion * getCohesionScale(material) + otherProps.cohesion * getCohesionScale(other.particleState.x));
                            if(cohesion > 0.0)
                            {
                                position += direction * (interactionDistance - distance) * cohesion * 0.5;
                            }
                        }
                    }
                }
            }

            processed += 1u;
            otherIndex = (otherIndex + interactionStride) % g_constants.particleCount;
        }
    }

    if(density > 1e-5)
    {
        let invDensity = 1.0 / density;
        let localCentroid = centroid * invDensity;
        let centroidDelta = position - localCentroid;
        let centroidDistance = length(centroidDelta);
        let centroidDirection = select(vec3f(0.0, 1.0, 0.0), centroidDelta / max(centroidDistance, 1e-5), centroidDistance > 1e-5);
        let compression = max(0.0, density - props.targetDensity);
        let underfill = max(0.0, props.targetDensity * 0.72 - density);
        let relaxationScale = getRelaxationScale(material);
        let pressureScale = radius * props.densityResponse * relaxationScale * 0.14;
        let tensionScale = radius * props.tensionResponse * (0.4 + g_constants.liquidRelaxation * 0.26) * 0.09;

        position += centroidDirection * compression * pressureScale;
        position -= centroidDirection * underfill * tensionScale;

        let densityRatio = clamp(density / max(props.targetDensity, 1.0), 0.0, 1.6);
        let neighbourVelocityAvg = neighbourVelocity * invDensity;
        let viscosityBlend = clamp(
            (props.velocityBlend + g_constants.liquidViscosity * props.viscosityResponse) * (0.3 + densityRatio * 0.45),
            0.0,
            0.94,
        );
        velocity = mix(velocity, neighbourVelocityAvg, viscosityBlend);

        let frictionBlend = clamp(
            props.frictionResponse * g_constants.frictionStrength * (0.35 + g_constants.plasticity * 0.65) * densityRatio,
            0.0,
            0.72,
        );
        velocity.x = mix(velocity.x, neighbourVelocityAvg.x, frictionBlend);
        velocity.z = mix(velocity.z, neighbourVelocityAvg.z, frictionBlend);
    }

    if(bondWeight > 1e-5)
    {
        let invBondWeight = 1.0 / bondWeight;
        let bondCentroidAvg = bondCentroid * invBondWeight;
        let bondRatio = clamp(bondWeight / max(props.targetDensity * 0.72, 1.0), 0.0, 1.45);
        let bondPull = clamp(props.bondResponse * getBondResponseScale(material) * (0.24 + bondRatio * 0.58), 0.0, 0.46);
        position = mix(position, bondCentroidAvg, vec3f(bondPull, bondPull * 0.9, bondPull));

        let bondVelocityAvg = bondVelocity * invBondWeight;
        let bondVelocityBlend = clamp(
            (props.bondVelocityResponse
                + g_constants.liquidViscosity * props.viscosityResponse * 0.16
                + select(0.0, g_constants.plasticity * 0.08, material == MaterialVisco))
                * (0.22 + bondRatio * 0.62),
            0.0,
            0.92,
        );
        velocity = mix(velocity, bondVelocityAvg, vec3f(bondVelocityBlend, bondVelocityBlend * 0.82, bondVelocityBlend));
    }

    var particleActive = 1.0;
    var contactNormal = vec3f(0.0);
    for(var shapeIndex = 0u; shapeIndex < g_constants.shapeCount; shapeIndex += 1u)
    {
        let shape = g_shapes[shapeIndex];
        let functionality = i32(shape.functionality);
        let shapeType = i32(shape.shapeType);

        if(functionality == ShapeFunctionCollider)
        {
            if(shapeType == ShapeTypeCircle)
            {
                let collision = solveSphereCollision(position, radius, shape);
                position = collision.position;
                if(collision.collided)
                {
                    contactNormal += collision.normal;
                }
            }
            else
            {
                let collision = solveBoxCollision(position, radius, shape);
                position = collision.position;
                if(collision.collided)
                {
                    contactNormal += collision.normal;
                }
            }
        }
        else if(functionality == ShapeFunctionDrain)
        {
            var inside = false;
            if(shapeType == ShapeTypeCircle)
            {
                inside = insideSphere(position, shape.position, shape.radius);
            }
            else
            {
                inside = insideBox(position, shape.position, shape.halfSize);
            }

            if(inside)
            {
                particleActive = 0.0;
            }
        }
    }

    let minBounds = vec3f(24.0, 24.0, 4.0) + vec3f(radius);
    let maxBounds = vec3f(
        max(48.0, f32(g_constants.gridSize.x) - 24.0),
        max(48.0, f32(g_constants.gridSize.y) - 24.0),
        max(8.0, f32(g_constants.gridSize.z) - 4.0)
    ) - vec3f(radius);
    var clampedPosition = position;
    if(position.x < minBounds.x)
    {
        clampedPosition.x = minBounds.x;
        contactNormal += vec3f(1.0, 0.0, 0.0);
    }
    else if(position.x > maxBounds.x)
    {
        clampedPosition.x = maxBounds.x;
        contactNormal += vec3f(-1.0, 0.0, 0.0);
    }
    if(position.y < minBounds.y)
    {
        clampedPosition.y = minBounds.y;
        contactNormal += vec3f(0.0, 1.0, 0.0);
    }
    else if(position.y > maxBounds.y)
    {
        clampedPosition.y = maxBounds.y;
        contactNormal += vec3f(0.0, -1.0, 0.0);
    }
    if(position.z < minBounds.z)
    {
        clampedPosition.z = minBounds.z;
        contactNormal += vec3f(0.0, 0.0, 1.0);
    }
    else if(position.z > maxBounds.z)
    {
        clampedPosition.z = maxBounds.z;
        contactNormal += vec3f(0.0, 0.0, -1.0);
    }

    var correctedVelocity = (clampedPosition - previousPosition) / max(g_constants.deltaTime, 1e-5);
    correctedVelocity = applyContactVelocityResponse(correctedVelocity, contactNormal, g_constants.borderFriction);

    let debugSpeed = length(correctedVelocity);

    g_particlesOut[particleIndex] = Particle3D(
        vec4f(clampedPosition, radius),
        vec4f(correctedVelocity, debugSpeed),
        vec4f(restPosition, density),
        vec4f(material, particleActive, particle.particleState.z, 0.0)
    );
}
