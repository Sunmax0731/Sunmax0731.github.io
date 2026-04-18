//-----------------------------------------------------------------------------
// Copyright (c) 2024 Electronic Arts.  All rights reserved.
//-----------------------------------------------------------------------------

//!insert SimEnums
//!insert RenderEnums
//!insert Render3DConstants

struct Particle3D
{
    positionRadius: vec4f,
    velocitySpeed: vec4f,
    restPositionDensity: vec4f,
    particleState: vec4f,
};

@group(0) @binding(0) var<uniform> g_constants : Render3DConstants;
@group(0) @binding(1) var<storage> g_particles : array<Particle3D>;

struct VertexOutput
{
    @builtin(position) clipPosition: vec4f,
    @location(0) localCoord: vec2f,
    @location(1) speedT: f32,
    @location(2) densityT: f32,
    @location(3) material: f32,
    @location(4) alpha: f32,
};

const s_quadVertices = array(
    vec2f(-1.0, -1.0),
    vec2f(1.0, -1.0),
    vec2f(1.0, 1.0),
    vec2f(-1.0, -1.0),
    vec2f(1.0, 1.0),
    vec2f(-1.0, 1.0)
);

fn getStandardColor(material: f32) -> vec3f
{
    if(material == MaterialElastic)
    {
        return vec3f(0.97, 0.67, 0.34);
    }

    if(material == MaterialSand)
    {
        return vec3f(0.79, 0.67, 0.43);
    }

    if(material == MaterialVisco)
    {
        return vec3f(0.53, 0.80, 0.66);
    }

    return vec3f(0.32, 0.72, 0.98);
}

fn heatmapColor(t: f32) -> vec3f
{
    let clamped = clamp(t, 0.0, 1.0);
    return mix(
        mix(vec3f(0.08, 0.28, 0.82), vec3f(0.12, 0.88, 0.96), smoothstep(0.0, 0.35, clamped)),
        mix(vec3f(0.98, 0.92, 0.36), vec3f(1.0, 0.34, 0.22), smoothstep(0.35, 1.0, clamped)),
        step(0.35, clamped)
    );
}

fn compressionColor(t: f32) -> vec3f
{
    let clamped = clamp(t, 0.0, 1.0);
    return mix(vec3f(0.15, 0.35, 0.92), vec3f(0.97, 0.42, 0.18), clamped);
}

fn projectWorldPosition(worldPosition: vec3f) -> vec4f
{
    let relative = worldPosition - g_constants.cameraPosition;
    let x = dot(relative, g_constants.cameraRight);
    let y = dot(relative, g_constants.cameraUp);
    let z = dot(relative, g_constants.cameraForward);

    if(z <= 1.0)
    {
        return vec4f(2.0, 2.0, 0.0, 1.0);
    }

    let focal = 1.0 / tan(g_constants.fov * 0.5);
    let aspect = g_constants.canvasSize.x / max(g_constants.canvasSize.y, 1.0);
    let ndcX = (x / z) * focal / aspect;
    let ndcY = (y / z) * focal;
    let ndcZ = clamp(z / 4000.0, 0.0, 1.0);
    return vec4f(ndcX, ndcY, ndcZ, 1.0);
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexId: u32, @builtin(instance_index) instanceId: u32) -> VertexOutput
{
    let particle = g_particles[instanceId];
    let particleActive = particle.particleState.y >= 0.5;
    if(!particleActive)
    {
        return VertexOutput(vec4f(2.0, 2.0, 0.0, 1.0), vec2f(0.0), 0.0, 0.0, 0.0, 0.0);
    }

    let localCoord = s_quadVertices[vertexId];
    let particleRadius = particle.positionRadius.w * g_constants.particleScale;
    let worldPosition = particle.positionRadius.xyz
        + (g_constants.cameraRight * localCoord.x + g_constants.cameraUp * localCoord.y) * particleRadius;
    let clipPosition = projectWorldPosition(worldPosition);

    let maxSpeed = max(g_constants.maxSpeed, 1.0);
    let maxDensity = max(g_constants.maxDensity, 1.0);
    let speedT = clamp(particle.velocitySpeed.w / maxSpeed, 0.0, 1.0);
    let densityT = clamp(particle.restPositionDensity.w / maxDensity, 0.0, 1.0);
    let alpha = clamp(1.08 - clipPosition.z * 0.45, 0.2, 0.92);

    return VertexOutput(
        clipPosition,
        localCoord,
        speedT,
        densityT,
        particle.particleState.x,
        alpha
    );
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f
{
    let distanceFromCenter = length(input.localCoord);
    if(distanceFromCenter > 1.0)
    {
        discard;
    }

    var color = getStandardColor(input.material);
    if(g_constants.renderMode == RenderModeCompression)
    {
        color = compressionColor(input.densityT);
    }
    else if(g_constants.renderMode == RenderModeVelocity)
    {
        color = heatmapColor(input.speedT);
    }
    else
    {
        let sphereZ = sqrt(max(0.0, 1.0 - distanceFromCenter * distanceFromCenter));
        let normal = normalize(vec3f(input.localCoord.x, -input.localCoord.y, sphereZ));
        let lightDir = normalize(vec3f(-0.38, -0.45, 0.82));
        let halfVector = normalize(lightDir + vec3f(0.0, 0.0, 1.0));
        let diffuse = 0.36 + 0.64 * max(dot(normal, lightDir), 0.0);
        let rim = pow(1.0 - max(normal.z, 0.0), 1.8);
        let highlight = pow(max(dot(normal, halfVector), 0.0), 22.0);
        color = color * diffuse + vec3f(1.0) * highlight * 0.34 + vec3f(0.92, 0.96, 1.0) * rim * 0.08;
    }

    let alpha = input.alpha * (1.0 - smoothstep(0.78, 1.0, distanceFromCenter));
    return vec4f(color, alpha);
}
