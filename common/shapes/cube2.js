///// CUBE DEFINTION
/////
///// Cube is defined to be centered at the origin of the coordinate reference system. 
///// Cube size is assumed to be 2.0 x 2.0 x 2.0 .
function Cube2 (scale) {

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

	//Coordinate texture

	this.texCoords = new Float32Array([
		0.0,scale,
		scale,scale,
		0.0,0.0,
		scale,0.0,

		0.0,scale,
		scale,scale,
		0.0,0.0,
		scale,0.0,

		0.0,scale,
		scale,scale,
		0.0,0.0,
		scale,0.0,

		0.0,scale,
		scale,scale,
		0.0,0.0,
		scale,0.0,

		0.0,scale,
		scale,scale,
		0.0,0.0,
		scale,0.0,

		0.0,scale,
		scale,scale,
		0.0,0.0,
		scale,0.0
		  ]);	

	// triangles definition
	////////////////////////////////////////////////////////////
	
	this.triangleIndices = new Uint16Array([
		0, 1, 2,  2, 1, 3,  // front
		4, 6, 5,  5, 6, 7,  // left
		8, 10, 9,  9, 10, 11,  // back
		12, 14, 13,  13, 14, 15,  // right
		16, 17, 18,  18, 17, 19,  // top
		21, 20, 22,  21, 22, 23   // bottom
	]);
	
	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
	
}