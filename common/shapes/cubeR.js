///// CUBE DEFINTION
/////
///// Cube is defined to be centered at the origin of the coordinate reference system. 
///// Cube size is assumed to be 2.0 x 2.0 x 2.0 .
function CubeRev  (n) {

	this.name = "cube2";
	
	// vertices definition
	////////////////////////////////////////////////////////////
	this.vertices = new Float32Array([
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,

         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,

        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,

        -1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,

        -1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0
	]);

	this.texCoords = new Float32Array([
		0.0,n,
		n,n,
		0.0,0.0,
		n,0.0,

		0.0,n,
		n,n,
		0.0,0.0,
		n,0.0,

		0.0,n,
		n,n,
		0.0,0.0,
		n,0.0,

		0.0,n,
		n,n,
		0.0,0.0,
		n,0.0,

		0.0,n,
		n,n,
		0.0,0.0,
		n,0.0,

		0.0,n,
		n,n,
		0.0,0.0,
		n,0.0
		  ]);	

	// triangles definition
	////////////////////////////////////////////////////////////
	
	this.triangleIndices = new Uint16Array([
		1, 0, 2,  1, 2, 3,  // front
		6, 4, 5,  6, 5, 7,  // left
		10, 8, 9,  10, 9, 11,  // back
		14, 12, 13,  14, 13, 15,  // right
		17, 16, 18,  17, 18, 19,  // top
		20, 21, 22,  22, 21, 23   // bottom
	]);
	
	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
	
}