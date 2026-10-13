// Math & utils
import { Vector, Vector3 } from './Vector.js';

export function zeroVector() {
	return new Vector(0, 0);
}

export function upVector() {
	return new Vector(0, -1);
}

export function rightVector() {
	return new Vector(1, 0);
}

export function add(A, B) {
	return new Vector(A.x + B.x, A.y + B.y);
}

export function sub(A, B) {
	return new Vector(A.x - B.x, A.y - B.y);
}

export function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

export function equal(A, B) {
	return A.x === B.x && A.y === B.y;
}

export function equalTolerance(A, B, Tolerance) {
	let x_error = Math.abs(A.x - B.x) < Tolerance;
	let y_error = Math.abs(A.y - B.y) < Tolerance;
	return x_error && y_error;
}

export function scale(vector, Ratio) {
	return new Vector(vector.x * Ratio, vector.y * Ratio);
}

export function length(vector) {
	return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

export function distance(A, B) {
	let sqdDist = squaredDistance(A, B);
	return Math.sqrt(sqdDist);
}

export function squaredDistance(A, B) {
	let dx = A.x - B.x;
	let dy = A.y - B.y;
	return dx * dx + dy * dy;
}

export function getAngle(A, B) {
	let dotVal = dot(normal(A), normal(B));
	let acos = Math.acos(clamp(dotVal, -1, 1));
	return acos * 180 / Math.PI;
}

export function normal(vector) {
	let len = length(vector);
	return len > 0 ? new Vector(vector.x / len, vector.y / len) : new Vector(0, 0);
}

export function invert(vector) {
	return new Vector(vector.x * -1, vector.y * -1);
}

export function dot(A, B) {
	return A.x * B.x + A.y * B.y;
}

export function dot3D(A, B) {
	return A.x * B.x + A.y * B.y + A.z * B.z;
}

export function cross(A, B) {
	return A.x * B.y - A.y * B.x;
}

export function crossV3(A, B) {
	let x = A.y * B.z - A.z * B.y;
	let y = A.z * B.x - A.x * B.z;
	let z = A.x * B.y - A.y * B.x;
	return new Vector3(x, y, z);
}

export function sideVector(A, B) {
	let A_3D = new Vector3(A.x, A.y, 0);
	let C    = new Vector3(A.x, A.y, cross(A, B));

	let A_normal = crossV3(C, A_3D);
	let face = new Vector(A_normal.x, A_normal.y);
	return face.normalize();
}

export function tripleProduct(A, B, C) {
	let z = cross(A, B);
	return new Vector(-C.y * z, C.x * z);
}

export function isOnRight(A, B) {
	let up = new Vector3(0, 0, 1);
	let dotValue = dot3D(up, new Vector3(0, 0, cross(A, B)));
	return dotValue > 0;
}

export function getUV(A, B, P) {
	let dirAB = sub(B, A);
	let lenAB = dirAB.getLength();
	let norAB = dirAB.normalize();
	let dirAP = sub(P, A);

	const region = lenAB > 0 ? dot(norAB, dirAP) / lenAB : 0;
	return { u: 1 - region, v: region };
}

export function lerpVector(A, B, W) {
	return new Vector(A.x * W.u + B.x * W.v, A.y * W.u + B.y * W.v);
}

export function rotateAngleAxis(pivot, point, angle) {
	let radian = (Math.PI / 180) * angle;
	let cos = Math.cos(radian);
	let sin = Math.sin(radian);

	let x = (cos * (point.x - pivot.x)) + (sin * (point.y - pivot.y)) + pivot.x;
	let y = (cos * (point.y - pivot.y)) - (sin * (point.x - pivot.x)) + pivot.y;

	return new Vector(x, y);
}

export function rotateVector(vector, angle) {
	let radian = (Math.PI / 180) * -angle;
	let cos = Math.cos(radian);
	let sin = Math.sin(radian);

	let x = vector.x * cos - vector.y * sin;
	let y = vector.x * sin + vector.y * cos;

	return new Vector(x, y);
}

export function center(A, B, Ratio = 0.5) {
	var x, y;

	if (A.x > B.x) {
		x = B.x + (A.x - B.x) * (1 - Ratio);
	} else {
		x = A.x + (B.x - A.x) * Ratio;
	}

	if (A.y > B.y) {
		y = B.y + (A.y - B.y) * (1 - Ratio);
	} else {
		y = A.y + (B.y - A.y) * Ratio;
	}

	return new Vector(x, y);
}

export function centerOfTriangle(trianglePoints) {
	let A = trianglePoints[0];
	let B = trianglePoints[1];
	let C = trianglePoints[2];

	return new Vector((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3);
}

export function triangleArea(trianglePoints) {
	let A = trianglePoints[0];
	let B = trianglePoints[1];
	let C = trianglePoints[2];

	return Math.abs(cross(sub(B, A), sub(C, A))) / 2;
}

// Area-weighted center of a simple polygon (shoelace formula)
export function polygonCentroid(points) {
	let area = 0;
	let x = 0;
	let y = 0;

	for (let i = 0; i < points.length; i++) {
		const p = points[i];
		const q = points[(i + 1) % points.length];
		const c = cross(p, q);

		area += c;
		x += (p.x + q.x) * c;
		y += (p.y + q.y) * c;
	}

	// degenerate (collinear) polygon : fall back to the vertex average
	if (Math.abs(area) < 1e-9) {
		let sum = zeroVector();
		for (let i = 0; i < points.length; i++) {
			sum = add(sum, points[i]);
		}
		return scale(sum, 1 / points.length);
	}

	return new Vector(x / (3 * area), y / (3 * area));
}

export function intersectAABB(A, B) {
	return (A.minX <= B.maxX && A.maxX >= B.minX) && 
	       (A.minY <= B.maxY && A.maxY >= B.minY);
}

export function containsVector(array, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].x === value.x && array[i].y === value.y) {
			return true;
		}
	}
	return false;
}

export function removeFromArray(Arr, value) {
	for (var i = 0; i < Arr.length; i++) {
		if (Arr[i] === value) {
			Arr.splice(i, 1); 
			break;
		}
	}
}

export function degreeToRadian(degree) {
	return -degree * (Math.PI / 180);
}

// Backward-compatible alias for typo
export const dgreeToRadian = degreeToRadian;

export function random(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}