uniformShader = function (gl) {
  var vertexShaderSource = `
  //Matrici esterne
  uniform mat4 uModelMatrix; 
  uniform mat4 uViewMatrix;            
  uniform mat4 uProjectionMatrix;  

  //Faro della macchina
  uniform mat4 uFaro; //faro CON applicazione di Projection Matrix
  uniform mat4 uFaroView; //faro SENZA applicazione di Projection Matrix
  
  //Definiti all'esterno da un object buffer
  attribute vec3 aPosition;           
  attribute vec2 aTexCoords;
  attribute vec3 aNormal;

  //Direzione luce del Sole, fissa per ogni frammento
  uniform vec3 uSunDirection;
  varying vec3 vSunDirV; //direzione della luce del sole da passare al fragment (con View Matrix applicata)

  //Direzione di vista da interpolare
  varying vec3 vViewDirect;

  //Normale da interpolare
  varying vec3 vNormal;

  //Posizione da passare al fragmentShader
  varying vec3 vPosition;
  
  //Coordinate texture da interpolare per il fragment
  varying vec2 vTexCoords;

  //Faro della macchina
  varying vec4 vFaroCoordsP; //coordinate texture della luce del faro CON applicazione di Projection Matrix
  varying vec3 vFaroCoords; //coordinate texture della luce del faro SENZA applicazione di Projection Matrix
  varying vec3 vFaroNormal; //normale da passare al fragment shader rispetto alla View Matrix del faro

  mat3 transpose(mat3 matrix) {//calcolo della trasposta di una matrice
    vec3 row0 = matrix[0];
    vec3 row1 = matrix[1];
    vec3 row2 = matrix[2];
    mat3 result = mat3(
        vec3(row0.x, row1.x, row2.x),
        vec3(row0.y, row1.y, row2.y),
        vec3(row0.z, row1.z, row2.z)
    );
    return result;
  }

  float det(mat2 matrix) {//calcolo del determinante di una matrice
      return matrix[0].x * matrix[1].y - matrix[0].y * matrix[1].x;
  }

  mat3 inverse(mat3 matrix) {//calcolo dell'inversa di una matrice
    vec3 row0 = matrix[0];
    vec3 row1 = matrix[1];
    vec3 row2 = matrix[2];

    vec3 minors0 = vec3(
        det(mat2(row1.y, row1.z, row2.y, row2.z)),
        det(mat2(row1.z, row1.x, row2.z, row2.x)),
        det(mat2(row1.x, row1.y, row2.x, row2.y))
    );
    vec3 minors1 = vec3(
        det(mat2(row2.y, row2.z, row0.y, row0.z)),
        det(mat2(row2.z, row2.x, row0.z, row0.x)),
        det(mat2(row2.x, row2.y, row0.x, row0.y))
    );
    vec3 minors2 = vec3(
        det(mat2(row0.y, row0.z, row1.y, row1.z)),
        det(mat2(row0.z, row0.x, row1.z, row1.x)),
        det(mat2(row0.x, row0.y, row1.x, row1.y))
    );

    mat3 adj = transpose(mat3(minors0, minors1, minors2));

    return (1.0 / dot(row0, minors0)) * adj;
  }
  
  void main(void){

    mat4 ModelViewMatrix = uViewMatrix*uModelMatrix;

    //Calcolo delle coordinate texture per il faro della macchina da interpolare
    vFaroCoordsP =  uFaro * uModelMatrix *  vec4(aPosition, 1.0);
    vFaroCoords =  (uFaroView * uModelMatrix *  vec4(aPosition, 1.0)).xyz;

    //Calcolo della normale dal punto di vista del faro della macchina da interpolare
    vFaroNormal = normalize(transpose(inverse(mat3(uFaroView * uModelMatrix))) * aNormal).xyz;

    //Calcolo della direzione della luce del Sole rispetto alla ViewMatrix
    vSunDirV = normalize(uViewMatrix * vec4(uSunDirection,0.0)).xyz;
 
    //Calcolo della normale da interpolare
    vNormal = normalize(transpose(inverse(mat3(ModelViewMatrix))) * aNormal).xyz;

    //Calcolo della direzione di vista
    vViewDirect = normalize(-(ModelViewMatrix *	vec4(aPosition, 1.0)).xyz);

    //Calcolo del vettore posizione
    vPosition = (ModelViewMatrix * vec4(aPosition, 1.0)).xyz;

    //Passo le coordinate texture al Fragment Shader
    vTexCoords = aTexCoords; 

    gl_Position = uProjectionMatrix * vec4(vPosition, 1.0); 
  }                                              
`;

  var fragmentShaderSource = `
  #extension GL_OES_standard_derivatives : enable
  
  precision highp float; 

  uniform vec4 uColor;  //Colore base del frammento 
  uniform sampler2D uSampler; //Sampler Texture base
  uniform sampler2D uSamplerF;  //Sampler  Faro della macchina
  uniform sampler2D uSamplerD;  //Sampler  Profondità calcolata in shaders_depth.js
  
  uniform mat4 uViewMatrix;
  
  //Contributo colore Texture base
  uniform float uKTex;

  //Tipologia di Shading
  uniform int uShType;
      
  //Coefficienti per le componenti del Phong Lighting
  uniform vec3 uKDiffuse; //Componente Diffusiva
  uniform vec4 uKSpecular; //Componente Speculare
  
  //Componente emissiva per il Phong Lighting
  uniform vec3 uKEm;
  
  //Lampioni
  uniform vec3 uLArrayPos[12]; //array di posizioni per i lampioni
  uniform vec3 uLArrayDir[12]; //array di direzioni delle luci dei lampioni
  
  //Direzione del sole, fissa per ogni frammento
  varying vec3 vSunDirV;
  
  //Direzione di vista interpolata
  varying vec3 vViewDirect;
  
  //Normale interpolata
  varying vec3 vNormal; 
  
  //Posizione frammento
  varying vec3 vPosition;
  
  //Coordinate texture frammento
  varying vec2 vTexCoords;   
  
  //Faro della macchina
  varying vec4 vFaroCoordsP; //coordinate texture della luce del faro CON applicazione di Projection Matrix
  varying vec3 vFaroCoords; //coordinate texture della luce del faro SENZA applicazione di Projection Matrix
  varying vec3 vFaroNormal; //normale da passare al fragment shader rispetto alla View Matrix del faro
  
  void main(void){                   
    
    //Saranno utilizzate normali differenti a seconda del fatto che la modalità di Shading sia Flat o Phong
    vec3 N;
    vec3 NFaro;
    if(uShType == 0){ //Phong Shading
    N = vNormal;
    NFaro = vFaroNormal;
    }
    else{ //Flat Shading
    N = normalize(cross(dFdx(vPosition),dFdy(vPosition)));
    NFaro = normalize(cross(dFdx(vFaroCoords),dFdy(vFaroCoords)));
    }
  
    //Luce del faro della macchina
    vec4 faroColor = vec4(0.0,0.0,0.0,0.0);
    float faroDepth = 0.0;
  
    //Calcolo delle coordinate texture e depth
    vec4 cordT = (vFaroCoordsP/(abs(vFaroCoordsP.w)*0.2))*0.5 + 0.5;
    vec4 cordTNor = (vFaroCoordsP/vFaroCoordsP.w)*0.5 + 0.5;
    float bias = 0.0; 
    //bias = 0.0007;
  
    if(cordT.x <= 1.0 && cordT.x >= 0.0 && cordT.y <= 1.0 && cordT.y >= 0.0 && cordT.z > 0.0){
      faroColor = texture2D(uSamplerF,cordT.xy); 
      float faroDepth = texture2D(uSamplerD,cordTNor.xy).x;
      if(faroDepth + bias < cordTNor.z) faroColor.w = 0.0; //Shadow Mapping
      if(dot(NFaro, cordT.xyz) <= 0.0) faroColor.w = 0.0; //Rimozione luce backface
    }
          
    //Viene stabilito il colore base dall'oggetto bilanciando con il coefficiente il contributo texture
    vec4 coloreOgg = texture2D(uSampler,vTexCoords)*uKTex + uColor*(1.0-uKTex);
  
    //Coefficiente per il contributo della componente di ambiente del Lighting (intensità del colore dell'oggetto prima del lighting vero e proprio)
    float KAmb = 0.2;
    //Coefficiente per il contributo della luce solare
    float KSun = 0.8;
  
    //Colore della luce dei lampioni
    vec3 LuceLampioni = vec3(1.0, 0.2, 0.1);
  
    //Le seguenti matrici semplificano la visualizzazione delle future moltiplicazioni (elementi sulla diagonale -> coefficienti moltiplicativi per componente)
    //Coefficienti per la LUCE SPECULARE
    mat3 KSpecular = mat3(uKSpecular.x, 0.0, 0.0,
                          0.0, uKSpecular.y, 0.0,  
                          0.0, 0.0, uKSpecular.z);
    //Coefficienti per la LUCE DIFFUSA
    mat3 KDiffuse = mat3(uKDiffuse.x , 0.0, 0.0,
                         0.0, uKDiffuse.y, 0.0, 
                         0.0, 0.0, uKDiffuse.z);
  
    //Componente diffusiva della luce Solare
    float cosDiffuse = max(dot(vSunDirV,N),0.0);
  
    //Direzione della riflessione
    vec3 R = normalize(-vSunDirV + 2.0 * dot(vSunDirV,N)*N);
  
    //Componente speculare della luce Solare
    float cosSpecularS = pow(dot(vViewDirect,R),uKSpecular.w);
    if (cosSpecularS<=0.0) cosSpecularS = 0.0;
  
    //Accumulo le conseguenze del lighting per il Sole al colore del frammento
    vec3 finale = ((coloreOgg.xyz * KDiffuse) * cosDiffuse + (coloreOgg.xyz * KSpecular) * cosSpecularS) * KSun;
  
    //Luci dei LAMPIONI
    float coseno_interno = 0.95;
    float coseno_esterno = 0.60;
  
    //Operazioni eseguite per ogni lampione
    for(int i = 0; i<12; i++){ 
      //Si calcola il vettore direzione tra il Lampione ed il frammento
      vec3 vecDirLamp = vPosition - uLArrayPos[i];
      //Si calcola il coseno dell'angolo tra la direzione del lampione e il vettore appena calcolato
      float cosAlpha = dot(normalize(vecDirLamp), uLArrayDir[i]);
    
      if(cosAlpha >= coseno_esterno){ //Se il frammento rientra nel cono più esterno
        float fS;
        //Coefficienti per la formula del termine di attenuazione
        float c1 = 1.0;
        float c2 = 0.1;
        //Lunghezza del vettore direzione tra il Lampione ed il frammento
        float vDL_len = sqrt(dot(vecDirLamp, vecDirLamp));
        float att_Term = min(1.0 , 1.0 / c2*vDL_len + c1 );

        if(cosAlpha >= coseno_interno){ fS = 1.0;} //Se il frammento rientra nel cono più interno
        else { fS = pow(cosAlpha, 2.0);}
    
        vecDirLamp = normalize(-vecDirLamp);
    
        //Componente diffusiva della luce del Lampione
        float cosDiffuseL = max(dot(vecDirLamp,N),0.0);
    
        //Direzione della riflessione della luce di un Lampione
        vec3 RL = normalize(-vecDirLamp + 2.0 * dot(vecDirLamp,N)*N);
    
        //Componente speculare della luce del Lampione
        float cosSpecularL = max(pow(dot(vViewDirect,RL),uKSpecular.w), 0.0000001);
    
        //Accumulo le conseguenze del lighting per il Lampione al colore del frammento
        finale = finale + (LuceLampioni * KDiffuse * cosDiffuseL * fS + LuceLampioni * KSpecular * cosSpecularL * fS ) * att_Term;
      }
    }
  
    //Viene accumulato al colore del frammento il contributo dato dal faro della macchina (dipendente dall'intensità nel punto)
    //finale = finale*(1.0 - faroColor.w) + faroColor.xyz*(faroColor.w);
    finale = finale + faroColor.xyz*(faroColor.w);

    //Il colore del frammento deriverà dunque dalla somma dei contributi delle varie componenti luminose
    gl_FragColor = vec4(finale + coloreOgg.xyz * KAmb + uKEm, 1.0);
  }
`;
  // create the vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  // create the fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  // Create the shader program
  var aPositionIndex = 0;
  var aNormalIndex = 1;
  var aTexCoordsIndex = 2;
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.bindAttribLocation(shaderProgram, aPositionIndex, "aPosition");
  gl.bindAttribLocation(shaderProgram, aNormalIndex, "aNormal");
  gl.bindAttribLocation(shaderProgram, aTexCoordsIndex, "aTexCoords");
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var str = "Unable to initialize the shader program.\n\n";
    str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
    str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
    str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
    alert(str);
  }

  shaderProgram.aPositionIndex = aPositionIndex;
  shaderProgram.aTexCoordsIndex = aTexCoordsIndex;
  shaderProgram.aNormalIndex = aNormalIndex;

  shaderProgram.uModelMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelMatrix");
  shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  shaderProgram.uFaroLocation = gl.getUniformLocation(shaderProgram, "uFaro");
  shaderProgram.uFaroViewLocation = gl.getUniformLocation(shaderProgram, "uFaroView");
  shaderProgram.uSunDirection = gl.getUniformLocation(shaderProgram, "uSunDirection");
  shaderProgram.uKDiffuseLocation = gl.getUniformLocation(shaderProgram, "uKDiffuse");
  shaderProgram.uKSpecularLocation = gl.getUniformLocation(shaderProgram, "uKSpecular");
  shaderProgram.uShTypeLocation = gl.getUniformLocation(shaderProgram, "uShType");
  shaderProgram.uKTextureLocation = gl.getUniformLocation(shaderProgram, "uKTex");
  shaderProgram.uKEmLocation = gl.getUniformLocation(shaderProgram, "uKEm");
  shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
  shaderProgram.uSamplerLocation = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.uSamplerFLocation = gl.getUniformLocation(shaderProgram, "uSamplerF");
  shaderProgram.uDepthSamplerLocation = gl.getUniformLocation(shaderProgram, "uSamplerD");

  //lamps
  shaderProgram.uLArrayDirLocation = gl.getUniformLocation(shaderProgram, "uLArrayDir");
  shaderProgram.uLArrayPosLocation = gl.getUniformLocation(shaderProgram, "uLArrayPos");
  return shaderProgram;
}; 
