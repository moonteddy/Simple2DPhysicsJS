
class Simplex
{
	vertices = [];  // Vector array

    constructor(){
        this.vertices = [];
    }

    get count(){
        return this.vertices.length;
    }

    clear(){
        this.vertices = [];
    }

    // Return true if this simplex contains input vertex
    containsVertex(vertex){
        for (let i = 0; i < this.count; i++){
            if (equal(vertex, this.vertices[i]))
                return true;
        }

        return false;
    }

    addVertex(vertex){
        if (this.containsVertex(vertex))
            return;

        if (this.count >= 3) 
            throw "2-simplex can have verticies less than 4";

        this.vertices.push(vertex);
    }

    shrink(indices){
        let res = [];

        for (let i = 0; i < indices.length; i++)
            res.push(this.vertices[indices[i]]);

        this.vertices = res;
    }

    // Returns the closest point to the input q
    getClosest(q){
        switch (this.count){
            case 1: // 0-Simplex: Point
                return { point: this.vertices[0], contributors: [0]};
            case 2: // 1-Simplex: Line segment
            {
                const a = this.vertices[0];
                const b = this.vertices[1];
                const w = getUV(a, b, q);

                if (w.v <= 0)
                    return { point: a, contributors: [0]};
                else if (w.v >= 1)
                    return { point: b, contributors: [1]};
                else
                    return { point: lerpVector(a, b, w), contributors: [0, 1]};
            }
            case 3: // 2-Simplex: Triangle
            {
                const a = this.vertices[0];
                const b = this.vertices[1];
                const c = this.vertices[2];

                const wab = getUV(a, b, q);
                const wbc = getUV(b, c, q);
                const wca = getUV(c, a, q);

                if (wca.u <= 0 && wab.v <= 0) // A area
                    return { point: a, contributors: [0]};
                else if (wab.u <= 0 && wbc.v <= 0) // B area
                    return { point: b, contributors: [1]};
                else if (wbc.u <= 0 && wca.v <= 0) // C area
                    return { point: c, contributors: [2]};

                // If area == 0, 3 vertices are in collinear position, which means all aligned in a line
                const area = cross(sub(b, a), sub(c, a));
                
                const u = cross(sub(b, q), sub(c, q));
                const v = cross(sub(c, q), sub(a, q));
                const w = cross(sub(a, q), sub(b, q));

                if (wab.u > 0 && wab.v > 0 && w * area <= 0) // On the AB edge
                {
                    return {point: lerpVector(a, b, wab), contributors: area == 0 ? [0, 1, 2] : [0, 1]};
                }
                else if (wbc.u > 0 && wbc.v > 0 && u * area <= 0) // On the BC edge
                {
                    return {point: lerpVector(b, c, wbc), contributors: area == 0 ? [0, 1, 2] : [1, 2]};
                }
                else if (wca.u > 0 && wca.u > 0 && v * area <= 0) // On the CA edge
                {
                    return {point: lerpVector(c, a, wca), contributors: area == 0 ? [0, 1, 2] : [2, 0]};
                }
                else // !!!!!!!! Inside the triangle , Collision hit !!!!!!!!
                {
                    return {point: q, contributors: []};
                }
            }
            default:
                throw "Error: Simplex constains vertices more than 3";
        }
    }

    getHitPoint(polygon, circle){
        let q = circle.position;
        let hitPoint = new Vector(0, 0);

        let minDist = Infinity;
        for (var i = 0; i < polygon.points.length; i++) {
            var j = i + 1 == polygon.points.length ? 0 : i + 1;
            var k = i + 2;

            if (i + 2 == polygon.points.length) {
                k = 0;
            }else if (i + 2 > polygon.points.length){
                k = 1;
            }

            const a = polygon.points[i];
            const b = polygon.points[j];
            const c = polygon.points[k];

            const wab = getUV(a, b, q);
            const wbc = getUV(b, c, q);

            if ( 0 < wab.v && wab.v < 1) {
                var hit = lerpVector(a, b, wab);
                var dist = squaredDistance(q, hit);
                if (dist < minDist) {
                    hitPoint = hit;
                    minDist = dist;
                }
            }else if (wab.u <= 0 && wbc.v <= 0){   // vertex area
                var dist = squaredDistance(q, b);
                if (dist < minDist) {
                    hitPoint = b;
                    minDist = dist;
                }
            }
        }


        return hitPoint;
    }

   
}