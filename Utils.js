// Math & utils

function zeroVector(){
	return new Vector(0, 0);
}

function upVector(){
	return new Vector(0, -1);
}

function rightVector(){
	return new Vector(1, 0);
}

// if you want to make a leftVector then, use "invert()" funciton. ex) invert(rightVector())

function add(A, B){
	return new Vector(A.x + B.x, A.y + B.y);
}

function sub(A, B){
	return new Vector(A.x - B.x, A.y - B.y);
}

function clamp(value, min, max){
	return Math.min(Math.max(value, min), max);
}

function equal(A, B){
	return A.x == B.x && A.y == B.y;
}

// equal with error
function equalTolerance(A, B, Tolerance){
	let x_error = Math.abs(A.x - B.x) < Tolerance;
	let y_error = Math.abs(A.y - B.y) < Tolerance;

	return x_error && y_error;
}

function scale(vector, Ratio) {
	return new Vector(vector.x * Ratio, vector.y * Ratio);
}

// Length of the vector.
function length(vector){
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

// Distance of two vectors. 
function distance(A, B){
	let sqdDist = squaredDistance(A, B);
	return Math.sqrt(sqdDist);
}

// squared Distance of two vectors. 
function squaredDistance(A, B){
	let dx = A.x - B.x;
	let dy = A.y - B.y;

	return dx * dx + dy * dy
}

// 0 ~ 180
function getAngle(A, B){
	let dot = dot(normal(A), normal(B));
	let acos = Math.acos(dot);
	return  acos * 180 / Math.PI;
}

// Normalize vector.
function normal(vector){
	let len = length(vector);
    return new Vector(vector.x / len, vector.y / len);
}

// invert vector
function invert(vector) {
	return new Vector(vector.x * -1, vector.y * -1);
}

// Dot product, scalar
function dot(A, B){
	return A.x * B.x + A.y * B.y;
}

function dot3D(A, B){
	return A.x * B.x + A.y * B.y + A.z * B.z;
}

// Cross product, Scalar
function cross(A, B){
	return A.x * B.y - A.y * B.x; // return "z" direction
}

// Cross product, Vector 3D
function crossV3(A, B){
	let x = A.y * B.z - A.z * B.y;
	let y = A.z * B.x - A.x * B.z;
	let z = A.x * B.y - A.y * B.x;
	return new Vector3(x, y, z);
}

//		A 
//    	|	  B
//		|	/ 
//		|--/-> A normal (return)   : direction to B
//		| /
//		|/
function sideVector(A, B){
	let A_3D = new Vector3(A.x, A.y, 0);
	let C    = new Vector3(A.x, A.y, cross(A, B));

	let A_normal = crossV3(C, A_3D);
	let face = new Vector(A_normal.x , A_normal.y);  // drop "z"

	return face.normalize();
}

// Returns a cross b cross c (assuming 0 as the third coordinate) 
function tripleProduct(A, B, C) {
  let z = cross(A, B);
  return new Vector(-C.y * z, C.x * z);
}

// if "B" is right on the "A" then return true.
function isOnRight(A, B){
	let up = new Vector3(0, 0, 1);
	let dotValue = dot3D(up, new Vector3(0, 0, cross(A, B)));
	
	return dotValue > 0;
}

// Project point p to edge ab, calculate barycentric weights and return it
function getUV(A, B, P){
    let dirAB = sub(B, A);
    let lenAB = dirAB.getLength();
    let norAB = dirAB.normalize();
    let dirAP = sub(P, A);
    
    const region = dot(norAB, dirAP) / lenAB;

    return { u: 1 - region, v: region };
}

// Linearly combine(interpolate) the vector using weights u, v
function lerpVector(A, B, W)
{
    return new Vector(A.x * W.u + B.x * W.v, A.y * W.u + B.y * W.v);
}

function rotateAngleAxis(pivot, point, angle) {
	let radian = (Math.PI / 180) * angle;
    let cos = Math.cos(radian);
    let sin = Math.sin(radian);

    let x = (cos * (point.x - pivot.x)) + (sin * (point.y - pivot.y)) + pivot.x;
    let y = (cos * (point.y - pivot.y)) - (sin * (point.x - pivot.x)) + pivot.y;

    return new Vector(x, y);
}

function rotateVector(vector, angle){
	let radian = (Math.PI / 180) * -angle;
    let cos = Math.cos(radian);
    let sin = Math.sin(radian);

    let x = vector.x * cos - vector.y * sin;
    let y = vector.x * sin + vector.y * cos;

	return new Vector(x, y);
}

function center(A, B, Ratio = 0.5){ // !! distance ratio from A !!
	var x,y;

	if (A.x > B.x) {
		x = B.x + (A.x - B.x) * (1 - Ratio);
	}else{
		x = A.x + (B.x - A.x) * Ratio;
	}

	if (A.y > B.y) {
		y = B.y + (A.y - B.y) * (1 - Ratio);
	}else{
		y = A.y + (B.y - A.y) * Ratio;
	}

	return new Vector(x, y);
}

function centerOfTriangle(trianglePoints){
	let A = trianglePoints[0];
	let B = trianglePoints[1];
	let C = trianglePoints[2];

	let centerBC = center(B, C);

	return center(A, centerBC, 0.66);
}

function triangleArea(trianglePoints){
	let A = trianglePoints[0];
	let B = trianglePoints[1];
	let C = trianglePoints[2];

	let centerBC = center(B, C);
	let A_centerBC = distance(A, centerBC);
	let B_C = distance(B, C);

	return (A_centerBC * B_C) / 2;
}

function intersectAABB(A, B) {
 	return (A.minX <= B.maxX && A.maxX >= B.minX) && 
 		   (A.minY <= B.maxY && A.maxY >= B.minY);
}

function containsVector(array, value){
	for (var i = 0; i < array.length; i++) {
		if (array[i].x == value.x && array[i].y == value.y) {
			return true;
		}
	}

	return false;
}

function removeFromArray(Arr, value){
	for (var i = 0; i < Arr.length; i++) {
		if (Arr[i] == value) {
			Arr.splice(i, 1); 
			break;
		}
	}
}

function dgreeToRadian(dgree){
	return -dgree * (Math.PI / 180);
}

function random(min, max) { // max includ
  return min + Math.floor(Math.random() * (max - min + 1));
}