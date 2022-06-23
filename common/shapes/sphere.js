function getP(a,b, resxz){return (a -1)*resxz + b;}

function Sphere(resy, resxz) {

    //valori troppo piccoli
    if(resy < 1) resy = 1;
    if(resxz < 3) resxz = 3;

    this.name = "sphere";
  
    // vertices definition
    ////////////////////////////////////////////////////////////
    
    this.vertices = new Float32Array((2 + resxz*resy)*3);
    
    var radius = 1.0;
    var angle;

    

    var stepy = Math.PI/++resy;
    var stepxz = 2 * Math.PI/resxz;

    //first lower vertex
    var i = 0;
    this.vertices[i++] = 0;
    this.vertices[i++] = -1;
    this.vertices[i++] = 0;
    var radius;


    for(let l = 1; l<resy; l++){

        let alpha = -Math.PI/2 + l*stepy;
        radius = Math.cos(alpha);
        for(let k = 0; k < resxz; k++){
            
            let beta = k*stepxz;
            //x , y , z
            this.vertices[i++] = Math.cos(beta)*radius;
            this.vertices[i++] = Math.sin(alpha);
            this.vertices[i++] = Math.sin(beta)*radius;
        }
    }
    //last upper vertex
    this.vertices[i++] = 0;
    this.vertices[i++] = 1;
    this.vertices[i++] = 0;


    this.numVertices = this.vertices.length/3;
    
    // triangles definition
    ////////////////////////////////////////////////////////////
    
     
    //this.triangleIndices = new Uint16Array(2*(resxz*3) + (resy-2)*(resxz*3)*2);
    this.triangleIndices = new Uint16Array((resxz*(resy - 1))*6);
    i = 0;

    //bottom
    for (var j = 1; j <= resxz; j++){
        if(j == resxz){
           this.triangleIndices[i++] = 0;
            this.triangleIndices[i++] = j;
            this.triangleIndices[i++] = 1;
        }else{
            this.triangleIndices[i++] = 0;
            this.triangleIndices[i++] = j;
            this.triangleIndices[i++] = j + 1;
        } 
    }
    
    //middle
    for (let a = 1; a <= resy -2 ; a++){
        for (let b = 1; b <= resxz; b++){
            if(b == resxz){
                this.triangleIndices[i++] = getP(a,b,resxz);
                this.triangleIndices[i++] = getP(a + 1,b + 1  - resxz,resxz);
                this.triangleIndices[i++] = getP(a,b + 1  - resxz,resxz);

                this.triangleIndices[i++] = getP(a + 1, b + 1  - resxz,resxz);
                this.triangleIndices[i++] = getP(a,b,resxz);
                this.triangleIndices[i++] = getP(a + 1 ,b,resxz);
            }else{
                this.triangleIndices[i++] = getP(a,b,resxz);
                this.triangleIndices[i++] = getP(a + 1,b + 1,resxz);
                this.triangleIndices[i++] = getP(a,b + 1,resxz);

                this.triangleIndices[i++] = getP(a + 1, b + 1,resxz);
                this.triangleIndices[i++] = getP(a,b,resxz);
                this.triangleIndices[i++] = getP(a + 1 ,b,resxz);
            }
        }
    }
    
    //top
    for (var j = this.numVertices - 2; j >= this.numVertices - 1 - resxz; j--){
        if(j == this.numVertices - 1 - resxz){
           this.triangleIndices[i++] = this.numVertices - 1;
            this.triangleIndices[i++] = j;
            this.triangleIndices[i++] = this.numVertices-2;
        }else{
            this.triangleIndices[i++] = this.numVertices - 1;
            this.triangleIndices[i++] = j;
            this.triangleIndices[i++] = j -1 ;
        } 
    }
    
    
    this.numTriangles = this.triangleIndices.length/3;
  }
  