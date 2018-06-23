//varying vec3 fcolor;
varying vec3 N;
varying vec4 vertexObserver;

attribute vec3 vpos;
attribute vec2 vTexture;
uniform mat4 mvpMatrix;

varying vec2 fTexture;

attribute vec3 vnormal;
uniform mat4 mvMatrix;
uniform mat4 normalsMatrix;

attribute vec3 vtangent;

varying mat3 tbn;

uniform bool hasNormalTexture;
uniform bool hasRefractionTexture;
uniform bool hasReflectionTexture;

varying vec3 uvw;
varying vec3 uvwRefraction;
varying vec3 uvwReflection;
uniform float refractionCoef;
uniform vec3 eyePos;
uniform mat4 ModelMatrix;

uniform bool skinned;
uniform mat4 animMatrices[64];
attribute vec4 vboneIndices;
attribute vec4 vboneWeights;


void main() {

	vec4 vpos4;

	if ( skinned )
	{
		mat4 boneTransform = mat4(1);
		for ( int i = 0; i < 4; ++i )
		{
			int index = int(vboneIndices[i]);
			if ( index > -1 )
				boneTransform += animMatrices[index] * vboneWeights[i];
		}
		
		vpos4 = boneTransform * vec4(vpos, 1);
	}
	else
	{
		vpos4 = vec4(vpos, 1);
	}


    gl_Position = mvpMatrix * vpos4;
    vec4 tempN = normalsMatrix * vec4(vnormal, 0);
    N = normalize(tempN.xyz);
    
    vertexObserver = mvMatrix * vpos4;
    
    fTexture = vTexture;
    
    // Calculos para normal mapping
    // Obtenido anteriormente en tempN
    //vec4 normalVector = normalsMatrix * vec4(vnormal, 0);
    
    // Calcular la matriz TBN con el vector normal y el vector tangente al vértice
    //tangent vector
    vec3 tangentVector = normalize((normalsMatrix * vec4(vtangent, 0)).xyz);
    
    vec3 bitangent = normalize(cross(N, tangentVector.xyz));
    
    //mat3 es matriz definida en columnas
    tbn = mat3(tangentVector, bitangent, N);
    
    
    // Cubemapping
    vec3 eye = normalize(vec3(ModelMatrix * vpos4) - eyePos);
    vec3 normal = vec3(ModelMatrix * vec4(vnormal, 0));
    
    if (hasRefractionTexture)
    {
        uvwRefraction = normalize(refract(eye, normal, refractionCoef));
        //uvw = refract(eye, normal, refractionCoef);
        //uvw = normalize(vpos);
    }
    else if (hasReflectionTexture)
    {
        uvwReflection = normalize(reflect(eye, normal));
        //uvw = reflect(eye, normal);
        //uvw = normalize(vpos);
    }
    else
    {
        uvw = normalize(vpos4.xyz);
    }
    
    
}
