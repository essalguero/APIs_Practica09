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
        if (isCubemap)
        {
            normalTextureSample = textureCube(normalTextureCube, uvw).xyz;
        }
        else
        {
            normalTextureSample = texture2D(normalTexture, fTexture).xyz;
        }
        
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


void main()
{
    vec4 diffuseComponent = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 specularComponent = vec4(0.0, 0.0, 0.0, 1.0);
    LightComponents currentLight;
    
    //vec4 totalIlumination = vec4(0, 0, 0, 1.0);
    
    if (numberLights > 0)
    {
        diffuseComponent = vec4(0.0, 0.0, 0.0, 1.0);
        
        for (int i = 0; i < numberLights; ++i)
        {
            currentLight = calculateLight(i);
            
            specularComponent += currentLight.specularComponent;
            diffuseComponent += currentLight.diffuseComponent;
            
        }
    }
        
    //if (hasColor) // Ahora todos los objetos deberian tener color (inicializado a vec4(1, 1, 1, 1) por defecto si no lo especifica el fichero de la maya
    //{
        // reorganizar codigo. Ahora todos los objetos tienen color
        if (isTexturized)
        {
            //gl_FragColor = vec4(1, 0, 0, 1);
            
            
            /////////////////////////////////////////////////////////////////
            //////////////////////Aqui no lee las textures///////////////////
            /////////////////////////////////////////////////////////////////
            
            
            vec4 calculatedColor = diffuseComponent * color;
            if (hasTexture)
             {
                 if (isCubemap)
                 {
                     calculatedColor *= textureCube(texSamplerCube, uvw);
                 }
                 else
                 {
                     calculatedColor *= texture2D(texSampler, fTexture);
                 }
             }
            
            calculatedColor += specularComponent;
            
            
            vec4 reflectionColor = vec4(0.0, 0.0, 0.0, 1.0);
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
                
            }
            
            vec4 refractionColor = vec4(0.0, 0.0, 0.0, 1.0);
            if (hasRefractionTexture)
            {
                if (isCubemap)
                {
                    refractionColor = textureCube(refractionTextureCube, uvwRefraction);
                }
                else
                {
                    refractionColor = texture2D(refractionTexture, fTexture);
                }
            }
            
            vec3 mixedColor = mix(calculatedColor.rgb, reflectionColor.rgb, reflectionColor.a);
            mixedColor = mix(mixedColor.rgb, refractionColor.rgb, refractionColor.a);
            gl_FragColor = vec4(mixedColor, 1.0f);

            /*if (isCubemap)
                gl_FragColor = vec4(uvw, 1);
            else
                if (hasNormalTexture)
                    //gl_FragColor = texture2D(texSample, fTexture);  // <---------------------- Aqui Tampoco Funciona
                    gl_FragColor = texture2D(normalTexture, fTexture);
                else
                    gl_FragColor = vec4(vec3(fTexture, 1), hasTexture);*/
            
            
            
        }    // if (isTexturized)
        else
        {
            gl_FragColor = (diffuseComponent * color) + specularComponent;
        }
        
    //} // if(hasColor)
    
    // for debugging
    //gl_FragColor = vec4(normalizedN, 1);
        
    
    
    
    
    
    /*else
    {
        if (isTexturized)
        {
            gl_FragColor = diffuse * texture2D(texSampler, fTexture);
            //gl_FragColor = color;
            
            gl_FragColor = vec4(1, 1, 1, 1);
        }
        else
        {
            gl_FragColor = color;
        }
    }*/
    
    
    
    /*if (hasColor)
     {
     gl_FragColor = vec4(N, 1);
     }
     else
     {
     gl_FragColor = vec4(1.0);
     }*/
    
    //gl_FragColor = vec4(1, 1, 1, 1);
    
    
    /////////////////////////////////////////////////////////////////
    //////////////////// Aqui lee las textures //////////////////////
    /////////////////////////////////////////////////////////////////
    
    //gl_FragColor = vec4((normalizedN * 0.5) + 0.5, 1);
    //gl_FragColor = texture2D(normalTexture, fTexture);
    //gl_FragColor = texture2D(texSampler, fTexture);
    //gl_FragColor = textureCube(reflectionTextureCube, uvw);
    //gl_FragColor = textureCube(refractionTextureCube, uvw);
    //gl_FragColor = vec4(uvw, 1);
    
    
    
}
