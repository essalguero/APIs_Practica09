varying vec3 N;
varying vec4 vertexObserver;

varying vec2 fTexture;
uniform bool isTexturized;
uniform bool hasColor;
uniform sampler2D texSampler;
uniform vec4 color;

const int MAX_LIGHTS = 8;

uniform int numberLights;
uniform vec4 diffuse;
uniform int shininess;
uniform vec3 ambientLight;

uniform bool isCubemap;

uniform bool hasNormalTexture;
varying mat3 tbn;
uniform bool hasRefractionTexture;
uniform bool hasReflectionTexture;

uniform samplerCube texSamplerCube;

uniform sampler2D normalTexture;
uniform samplerCube  normalTextureCube;

uniform sampler2D refractionTexture;
uniform samplerCube  refractionTextureCube;

uniform sampler2D reflectionTexture;
uniform samplerCube  reflectionTextureCube;

varying vec3 uvw;
varying vec3 uvwRefraction;
varying vec3 uvwReflection;

vec3 normalizedN;

uniform bool hasTexture;

uniform bool castShadows;
uniform sampler2D shadowTexture;
varying vec3 depthCoord;

struct LightInfo
{
    vec4 lightColor;
    float linearAttenuation;
    
    vec4 lightVector;
};
uniform LightInfo lights[MAX_LIGHTS];

struct LightComponents
{
    vec4 diffuseComponent;
    vec4 specularComponent;
};


LightComponents calculateLight(int i)
{
    
    LightComponents currentLight;
    
    vec4 diffuseComponent = vec4(ambientLight, 1.0);
    vec4 specularComponent = vec4(0.0, 0.0, 0.0, 1.0);
    float NdotL;
    
    normalizedN = normalize(N);
    
    if (hasNormalTexture)
    {
        // Lee una normal de la textura
        vec3 normalTextureSample;
        
        normalTextureSample = texture2D(normalTexture, fTexture).xyz;
        
        
        // Convertirla a normal a partir de rgb... Segun apuntes, para pasar de normal a normal = (rgb * 0.5) + 0.5
        // Paso contrario rgb = (normal - 0.5) / 0.5
        normalTextureSample = (normalTextureSample - 0.5) / 0.5;
        
        // Multiplicar por TBN
        normalizedN = normalTextureSample * tbn;
    }
    
    vec3 L = lights[i].lightVector.xyz;
    
    float attenuationFactor = 1.0;
    
    if (lights[i].lightVector.w == 1.0)
    {
        L = L - vertexObserver.xyz;
        attenuationFactor = 1.0 / (1.0 + (lights[i].linearAttenuation * length(L)));
    }
    
    L = normalize(L);
    NdotL = max(dot(normalizedN, L), 0.0);
    
    diffuseComponent += NdotL * lights[i].lightColor * attenuationFactor;
    
    if ((shininess > 0) && (NdotL > 0.0))
    {
        vec4 vertexObserverNorm = normalize(vertexObserver);
        vec3 H = L - vertexObserverNorm.xyz;
        H = normalize(H);
        
        float NdotH = max(dot(normalizedN, H), 0.0);
        
        specularComponent += pow(NdotH, float(shininess)) * attenuationFactor;
    }
    
    currentLight.diffuseComponent = diffuseComponent;
    currentLight.specularComponent = specularComponent;
    
    return currentLight;
}


void main2()
{
    vec3 diffuseComponent = vec3(1.0, 1.0, 1.0);
    vec3 specularComponent = vec3(0.0, 0.0, 0.0);
    LightComponents currentLight;
    
	// Si tiene luces, calcula el valor de difuso y especular
	// Si no tiene, los valores a los que se han inicializado arriba
	// son validos para los calculos
    if (numberLights > 0)
    {
        diffuseComponent = vec3(0.0, 0.0, 0.0);
        
        for (int i = 0; i < numberLights; ++i)
        {
            currentLight = calculateLight(i);
            
            specularComponent += vec3(currentLight.specularComponent);
            diffuseComponent += vec3(currentLight.diffuseComponent);
            
        }
    }

	diffuseComponent = min(diffuseComponent, vec3(1, 1, 1));
	specularComponent = min(specularComponent, vec3(1, 1, 1));

        
    //if (hasColor) // Ahora todos los objetos deberian tener color (inicializado a vec4(1, 1, 1, 1) por defecto si no lo especifica el fichero de la maya
    //{
        // Reorganizar codigo. Ahora todos los objetos tienen color
        if (isTexturized)
        {
            
			vec4 calculatedColor = vec4(1, 1, 1, 1);
            if (hasTexture)
             {
                 if (isCubemap)
                 {
                     calculatedColor = vec4(diffuseComponent, 1) * color * textureCube(texSamplerCube, uvw) + vec4(specularComponent, 0);
                 }
                 else
                 {
                     //calculatedColor = vec4(diffuseComponent, 1) * color * texture2D(texSampler, fTexture) + vec4(specularComponent, 0);
					 //calculatedColor = texture2D(texSampler, fTexture) * color * vec4(diffuseComponent, 1) + vec4(specularComponent, 0);
                 }
             }

			 
            
            //calculatedColor += vec4(specularComponent, 0);
            
            //vec3 mixedColor  = calculatedColor;

			if (castShadows)
			{
				vec4 shadowColor = vec4(1, 1, 1, 1);
				//float rValue;
				if ( texture2D(shadowTexture, vec2(depthCoord)).z < depthCoord.z  - 0.0009)
				{
					//shadowColor = texture2D(shadowTexture, vec2(depthCoord));
					
					shadowColor = vec4(ambientLight, 1);
				}

				//rValue = texture2D(shadowTexture, vec2(depthCoord)).r;

				//gl_FragColor = vec4(vec3(rValue), 1.0);
				//gl_FragColor = texture2D(shadowTexture, vec2(depthCoord));
				gl_FragColor = texture2D(texSampler, fTexture) * color * shadowColor * vec4(diffuseComponent, 1) + vec4(specularComponent, 0);
			}
			else
			{
				gl_FragColor = texture2D(texSampler, fTexture) * color * vec4(diffuseComponent, 1) + vec4(specularComponent, 0);
				gl_FragColor = texture2D(texSampler, fTexture) * color;
				//gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
			}

			gl_FragColor = texture2D(texSampler, fTexture);

			//gl_FragColor = calculatedColor;

            /*vec4 reflectionColor = vec4(0.0, 0.0, 0.0, 1.0);
            if (hasReflectionTexture)
            {
                if (isCubemap)
                {
                    reflectionColor = textureCube(reflectionTextureCube, uvwReflection);
                }
                else
                {
                    reflectionColor = texture2D(reflectionTexture, fTexture);
                }

				//calculatedColor = vec4(calculatedColor.rgb * reflectionColor.rgb, calculatedColor.a);
                
            }

            
            vec4 refractionColor = vec4(0.0, 0.0, 0.0, 1.0);
            if (hasRefractionTexture == true)
            {
                if (isCubemap)
                {
                    refractionColor = textureCube(refractionTextureCube, uvwRefraction);
                }
                else
                {
                    refractionColor = texture2D(refractionTexture, fTexture);
                }
				
				//calculatedColor = vec4(calculatedColor.rgb * refractionColor.rgb, calculatedColor.a);
            }
            
            // El color final es la mezcla de todos los valores calculados
			// Texture + refraction + reflection
            //gl_FragColor = calculatedColor;
			*/
			
			

        }    // if (isTexturized)
        else
        {
            gl_FragColor = (vec4(diffuseComponent, 1) * color) + vec4(specularComponent, 0);

        }
        
    //} // if(hasColor)
    gl_FragColor = texture2D(texSampler, fTexture);
}

void main()
{
	//gl_FragColor = texture2D(texSampler, fTexture);
	gl_FragColor = vec4(N, 1);
}
