/**
 * 处理 4 * 4 矩阵的工具类
 * */
export default class Matrix4 {

  /**
   * @static 类型数组的长度，4 * 4 矩阵长度为 16
   * */
  static size: number = 16;

  /**
   * @property {Float32Array} elements 最终传给着色器程序的类型数组
   * */
  elements: Float32Array;

  /**
   * @constructor 构造方法，默认实例化一个单位矩阵
   * @param {Matrix4} [matrix4] 类似于复制一个
   * */
  constructor(matrix4?: Matrix4) {
    let elements: Float32Array;
    if (matrix4) {
      const e = new Float32Array(Matrix4.size);
      for (let i = 0; i < Matrix4.size; i++) {
        e[i] = matrix4.elements[i];
      }
      elements = e;
    } else {
      elements = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    }
    this.elements = elements;
  }

  /**
   * 重置为单位矩阵
   * @return {Matrix4} 返回实例本身
   * */
  setIdentity() {
    const e = this.elements;
    e[0] = 1;   e[4] = 0;   e[8]  = 0;   e[12] = 0;
    e[1] = 0;   e[5] = 1;   e[9]  = 0;   e[13] = 0;
    e[2] = 0;   e[6] = 0;   e[10] = 1;   e[14] = 0;
    e[3] = 0;   e[7] = 0;   e[11] = 0;   e[15] = 1;
    return this;
  }

  /**
   * 拷贝矩阵
   * @param {Matrix4} matrix4 被拷贝的矩阵
   * @return {Matrix4} 返回实例本身
   * */
  set(matrix4: Matrix4) {
    if (this === matrix4 || this.elements === matrix4.elements) {
      return this;
    }
    const e = new Float32Array(Matrix4.size);
    for (let i = 0; i < Matrix4.size; i++) {
      e[i] = matrix4.elements[i];
    }
    return this;
  }

  /**
   * 右乘矩阵
   * @param {Matrix4} matrix4 用来乘的矩阵
   * @return {Matrix4} 实例本身
   * */
  multiply(matrix4: Matrix4) {
    let i, e, a, b, ai0, ai1, ai2, ai3;

    // 计算 e = a * b
    e = this.elements;
    a = this.elements;
    b = matrix4.elements;

    // 如果 e 和 b 是同一个，把 b 存进临时矩阵
    if (e === b) {
      b = new Float32Array(16);
      for (i = 0; i < 16; ++i) {
        b[i] = e[i];
      }
    }

    for (i = 0; i < 4; i++) {
      ai0=a[i];  ai1=a[i+4];  ai2=a[i+8];  ai3=a[i+12];
      e[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3];
      e[i+4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7];
      e[i+8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11];
      e[i+12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }

    return this;
  }

  /**
   * 将自己设置成自己的转置矩阵
   * @return {Matrix4} 返回实例本身
   * */
  transpose() {
    let e, t;

    e = this.elements;

    t = e[ 1];  e[ 1] = e[ 4];  e[ 4] = t;
    t = e[ 2];  e[ 2] = e[ 8];  e[ 8] = t;
    t = e[ 3];  e[ 3] = e[12];  e[12] = t;
    t = e[ 6];  e[ 6] = e[ 9];  e[ 9] = t;
    t = e[ 7];  e[ 7] = e[13];  e[13] = t;
    t = e[11];  e[11] = e[14];  e[14] = t;

    return this;
  }

  /**
   * 将实例设置成某一个矩阵的逆矩阵
   * @param {Matrix4} matrix4 需要被计算逆矩阵的矩阵
   * @return {Matrix4} 返回实例本身
   * */
  setInverseOf(matrix4: Matrix4) {
    let i, s, d, inv, det;

    s = matrix4.elements;
    d = this.elements;
    inv = new Float32Array(16);

    inv[0]  =   s[5]*s[10]*s[15] - s[5] *s[11]*s[14] - s[9] *s[6]*s[15]
      + s[9]*s[7] *s[14] + s[13]*s[6] *s[11] - s[13]*s[7]*s[10];
    inv[4]  = - s[4]*s[10]*s[15] + s[4] *s[11]*s[14] + s[8] *s[6]*s[15]
      - s[8]*s[7] *s[14] - s[12]*s[6] *s[11] + s[12]*s[7]*s[10];
    inv[8]  =   s[4]*s[9] *s[15] - s[4] *s[11]*s[13] - s[8] *s[5]*s[15]
      + s[8]*s[7] *s[13] + s[12]*s[5] *s[11] - s[12]*s[7]*s[9];
    inv[12] = - s[4]*s[9] *s[14] + s[4] *s[10]*s[13] + s[8] *s[5]*s[14]
      - s[8]*s[6] *s[13] - s[12]*s[5] *s[10] + s[12]*s[6]*s[9];

    inv[1]  = - s[1]*s[10]*s[15] + s[1] *s[11]*s[14] + s[9] *s[2]*s[15]
      - s[9]*s[3] *s[14] - s[13]*s[2] *s[11] + s[13]*s[3]*s[10];
    inv[5]  =   s[0]*s[10]*s[15] - s[0] *s[11]*s[14] - s[8] *s[2]*s[15]
      + s[8]*s[3] *s[14] + s[12]*s[2] *s[11] - s[12]*s[3]*s[10];
    inv[9]  = - s[0]*s[9] *s[15] + s[0] *s[11]*s[13] + s[8] *s[1]*s[15]
      - s[8]*s[3] *s[13] - s[12]*s[1] *s[11] + s[12]*s[3]*s[9];
    inv[13] =   s[0]*s[9] *s[14] - s[0] *s[10]*s[13] - s[8] *s[1]*s[14]
      + s[8]*s[2] *s[13] + s[12]*s[1] *s[10] - s[12]*s[2]*s[9];

    inv[2]  =   s[1]*s[6]*s[15] - s[1] *s[7]*s[14] - s[5] *s[2]*s[15]
      + s[5]*s[3]*s[14] + s[13]*s[2]*s[7]  - s[13]*s[3]*s[6];
    inv[6]  = - s[0]*s[6]*s[15] + s[0] *s[7]*s[14] + s[4] *s[2]*s[15]
      - s[4]*s[3]*s[14] - s[12]*s[2]*s[7]  + s[12]*s[3]*s[6];
    inv[10] =   s[0]*s[5]*s[15] - s[0] *s[7]*s[13] - s[4] *s[1]*s[15]
      + s[4]*s[3]*s[13] + s[12]*s[1]*s[7]  - s[12]*s[3]*s[5];
    inv[14] = - s[0]*s[5]*s[14] + s[0] *s[6]*s[13] + s[4] *s[1]*s[14]
      - s[4]*s[2]*s[13] - s[12]*s[1]*s[6]  + s[12]*s[2]*s[5];

    inv[3]  = - s[1]*s[6]*s[11] + s[1]*s[7]*s[10] + s[5]*s[2]*s[11]
      - s[5]*s[3]*s[10] - s[9]*s[2]*s[7]  + s[9]*s[3]*s[6];
    inv[7]  =   s[0]*s[6]*s[11] - s[0]*s[7]*s[10] - s[4]*s[2]*s[11]
      + s[4]*s[3]*s[10] + s[8]*s[2]*s[7]  - s[8]*s[3]*s[6];
    inv[11] = - s[0]*s[5]*s[11] + s[0]*s[7]*s[9]  + s[4]*s[1]*s[11]
      - s[4]*s[3]*s[9]  - s[8]*s[1]*s[7]  + s[8]*s[3]*s[5];
    inv[15] =   s[0]*s[5]*s[10] - s[0]*s[6]*s[9]  - s[4]*s[1]*s[10]
      + s[4]*s[2]*s[9]  + s[8]*s[1]*s[6]  - s[8]*s[2]*s[5];

    det = s[0]*inv[0] + s[1]*inv[4] + s[2]*inv[8] + s[3]*inv[12];
    if (det === 0) {
      return this;
    }

    det = 1 / det;
    for (i = 0; i < 16; i++) {
      d[i] = inv[i] * det;
    }

    return this;
  }

  /**
   * 将实例设置成自己的逆矩阵
   * @return {Matrix4} 返回实例本身
   * */
  invert() {
    return this.setInverseOf(this);
  }

  /**
   * 把自己设置成一个正射投影矩阵
   * @param {number} left 左投影区域
   * @param {number} right 右投影区域
   * @param {number} bottom 下投影区域
   * @param {number} top 上投影区域
   * @param {number} near 近投影区域
   * @param {number} far 远投影区域
   * @return {Matrix4} 返回实例本身
   * */
  setOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    let e, rw, rh, rd;

    if (left === right || bottom === top || near === far) {
      throw 'null frustum';
    }

    rw = 1 / (right - left);
    rh = 1 / (top - bottom);
    rd = 1 / (far - near);

    e = this.elements;

    e[0]  = 2 * rw;
    e[1]  = 0;
    e[2]  = 0;
    e[3]  = 0;

    e[4]  = 0;
    e[5]  = 2 * rh;
    e[6]  = 0;
    e[7]  = 0;

    e[8]  = 0;
    e[9]  = 0;
    e[10] = -2 * rd;
    e[11] = 0;

    e[12] = -(right + left) * rw;
    e[13] = -(top + bottom) * rh;
    e[14] = -(far + near) * rd;
    e[15] = 1;

    return this;
  }

  /**
   * 乘以某个正射投影矩阵，并把结果赋值给自己
   * @param {number} left 左投影区域
   * @param {number} right 右投影区域
   * @param {number} bottom 下投影区域
   * @param {number} top 上投影区域
   * @param {number} near 近投影区域
   * @param {number} far 远投影区域
   * @return {Matrix4} 返回实例本身
   * */
  ortho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    return this.multiply(new Matrix4().setOrtho(left, right, bottom, top, near, far));
  }

  /**
   * 把自己设置成一个透视投影矩阵
   * @param {number} fovy 上下可视范围-角度制
   * @param {number} aspect 可视范围近处宽高比
   * @param {number} near 投影区域近处距离
   * @param {number} far 投影区域远处距离
   * @return {Matrix4} 返回实例本身
   * */
  setPerspective(fovy: number, aspect: number, near: number, far: number) {
    let e, rd, s, ct;

    if (near === far || aspect === 0) {
      throw 'null frustum';
    }
    if (near <= 0) {
      throw 'near <= 0';
    }
    if (far <= 0) {
      throw 'far <= 0';
    }

    fovy = Math.PI * fovy / 180 / 2;
    s = Math.sin(fovy);
    if (s === 0) {
      throw 'null frustum';
    }

    rd = 1 / (far - near);
    ct = Math.cos(fovy) / s;

    e = this.elements;

    e[0]  = ct / aspect;
    e[1]  = 0;
    e[2]  = 0;
    e[3]  = 0;

    e[4]  = 0;
    e[5]  = ct;
    e[6]  = 0;
    e[7]  = 0;

    e[8]  = 0;
    e[9]  = 0;
    e[10] = -(far + near) * rd;
    e[11] = -1;

    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;

    return this;
  }

  /**
   * 乘以某个透视投影矩阵，并把结果赋值给自己
   * @param {number} fovy 上下可视范围-角度制
   * @param {number} aspect 可视范围近处宽高比
   * @param {number} near 投影区域近处距离
   * @param {number} far 投影区域远处距离
   * @return {Matrix4} 返回实例本身
   * */
  perspective(fovy: number, aspect: number, near: number, far: number) {
    return this.multiply(new Matrix4().setPerspective(fovy, aspect, near, far));
  }

  /**
   * 把自己设置成一个模型矩阵-scale
   * @param {number} x X-轴方向缩放比例
   * @param {number} y Y-轴方向缩放比例
   * @param {number} z Z-轴方向缩放比例
   * @return {Matrix4} 返回实例本身
   * */
  setScale(x: number, y: number, z: number) {
    const e = this.elements;
    e[0] = x;  e[4] = 0;  e[8]  = 0;  e[12] = 0;
    e[1] = 0;  e[5] = y;  e[9]  = 0;  e[13] = 0;
    e[2] = 0;  e[6] = 0;  e[10] = z;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    return this;
  }

  /**
   * 乘以某个模型矩阵-scale，并把结果赋值给自己
   * @param {number} x X-轴方向缩放比例
   * @param {number} y Y-轴方向缩放比例
   * @param {number} z Z-轴方向缩放比例
   * @return {Matrix4} 返回实例本身
   * */
  scale(x: number, y: number, z: number) {
    const e = this.elements;
    e[0] *= x;  e[4] *= y;  e[8]  *= z;
    e[1] *= x;  e[5] *= y;  e[9]  *= z;
    e[2] *= x;  e[6] *= y;  e[10] *= z;
    e[3] *= x;  e[7] *= y;  e[11] *= z;
    return this;
  }

  /**
   * 把自己设置成一个模型矩阵-translation
   * @param {number} x X-轴方向平移距离
   * @param {number} y Y-轴方向平移距离
   * @param {number} z Z-轴方向平移距离
   * @return {Matrix4} 返回实例本身
   * */
  setTranslate(x: number, y: number, z: number) {
    const e = this.elements;
    e[0] = 1;  e[4] = 0;  e[8]  = 0;  e[12] = x;
    e[1] = 0;  e[5] = 1;  e[9]  = 0;  e[13] = y;
    e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = z;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    return this;
  }

  /**
   * 乘以某个模型矩阵-translation，并把结果赋值给自己
   * @param {number} x X-轴方向平移距离
   * @param {number} y Y-轴方向平移距离
   * @param {number} z Z-轴方向平移距离
   * @return {Matrix4} 返回实例本身
   * */
  translate(x: number, y: number, z: number) {
    const e = this.elements;
    e[12] += e[0] * x + e[4] * y + e[8]  * z;
    e[13] += e[1] * x + e[5] * y + e[9]  * z;
    e[14] += e[2] * x + e[6] * y + e[10] * z;
    e[15] += e[3] * x + e[7] * y + e[11] * z;
    return this;
  }

  /**
   * 把自己设置成一个模型矩阵-rotate
   * @param {number} angle 旋转角度
   * @param {number} x 旋转轴向量的 X 轴坐标
   * @param {number} y 旋转轴向量的 Y 轴坐标
   * @param {number} z 旋转轴向量的 Z 轴坐标
   * @return {Matrix4} 返回实例本身
   * */
  setRotate(angle: number, x: number, y: number, z: number) {
    let e, s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;

    angle = Math.PI * angle / 180;
    e = this.elements;

    s = Math.sin(angle);
    c = Math.cos(angle);

    if (0 !== x && 0 === y && 0 === z) {
      // Rotation around X axis
      if (x < 0) {
        s = -s;
      }
      e[0] = 1;  e[4] = 0;  e[ 8] = 0;  e[12] = 0;
      e[1] = 0;  e[5] = c;  e[ 9] =-s;  e[13] = 0;
      e[2] = 0;  e[6] = s;  e[10] = c;  e[14] = 0;
      e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    } else if (0 === x && 0 !== y && 0 === z) {
      // Rotation around Y axis
      if (y < 0) {
        s = -s;
      }
      e[0] = c;  e[4] = 0;  e[ 8] = s;  e[12] = 0;
      e[1] = 0;  e[5] = 1;  e[ 9] = 0;  e[13] = 0;
      e[2] =-s;  e[6] = 0;  e[10] = c;  e[14] = 0;
      e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    } else if (0 === x && 0 === y && 0 !== z) {
      // Rotation around Z axis
      if (z < 0) {
        s = -s;
      }
      e[0] = c;  e[4] =-s;  e[ 8] = 0;  e[12] = 0;
      e[1] = s;  e[5] = c;  e[ 9] = 0;  e[13] = 0;
      e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = 0;
      e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    } else {
      // Rotation around another axis
      len = Math.sqrt(x*x + y*y + z*z);
      if (len !== 1) {
        rlen = 1 / len;
        x *= rlen;
        y *= rlen;
        z *= rlen;
      }
      nc = 1 - c;
      xy = x * y;
      yz = y * z;
      zx = z * x;
      xs = x * s;
      ys = y * s;
      zs = z * s;

      e[ 0] = x*x*nc +  c;
      e[ 1] = xy *nc + zs;
      e[ 2] = zx *nc - ys;
      e[ 3] = 0;

      e[ 4] = xy *nc - zs;
      e[ 5] = y*y*nc +  c;
      e[ 6] = yz *nc + xs;
      e[ 7] = 0;

      e[ 8] = zx *nc + ys;
      e[ 9] = yz *nc - xs;
      e[10] = z*z*nc +  c;
      e[11] = 0;

      e[12] = 0;
      e[13] = 0;
      e[14] = 0;
      e[15] = 1;
    }

    return this;
  }

  /**
   * 乘以某个模型矩阵-rotate，并把结果赋值给自己
   * @param {number} angle 旋转角度
   * @param {number} x 旋转轴向量的 X 轴坐标
   * @param {number} y 旋转轴向量的 Y 轴坐标
   * @param {number} z 旋转轴向量的 Z 轴坐标
   * @return {Matrix4} 返回实例本身
   * */
  rotate(angle: number, x: number, y: number, z: number) {
    return this.multiply(new Matrix4().setRotate(angle, x, y, z));
  }

  /**
   * 把自己设置成一个视图矩阵
   * @param {number} eyeX 视点的 X 坐标
   * @param {number} eyeY 视点的 Y 坐标
   * @param {number} eyeZ 视点的 Z 坐标
   * @param {number} centerX 视线目标的 X 坐标
   * @param {number} centerY 视线目标的 Y 坐标
   * @param {number} centerZ 视线目标的 Z 坐标
   * @param {number} upX 上方向向量的 X 轴分量
   * @param {number} upY 上方向向量的 Y 轴分量
   * @param {number} upZ 上方向向量的 Z 轴分量
   * @return {Matrix4} 返回实例本身
   * */
  setLookAt(
    eyeX: number, eyeY: number, eyeZ: number,
    centerX: number, centerY: number, centerZ: number,
    upX: number, upY: number, upZ: number
  ) {
    let e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

    fx = centerX - eyeX;
    fy = centerY - eyeY;
    fz = centerZ - eyeZ;

    // Normalize f.
    rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;

    // Calculate cross product of f and up.
    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;

    // Normalize s.
    rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;

    // Calculate cross product of s and f.
    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;

    // Set to this.
    e = this.elements;
    e[0] = sx;
    e[1] = ux;
    e[2] = -fx;
    e[3] = 0;

    e[4] = sy;
    e[5] = uy;
    e[6] = -fy;
    e[7] = 0;

    e[8] = sz;
    e[9] = uz;
    e[10] = -fz;
    e[11] = 0;

    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;

    // Translate.
    return this.translate(-eyeX, -eyeY, -eyeZ);
  }

  /**
   * 乘以某个视图矩阵，并把结果赋值给自己
   * @param {number} eyeX 视点的 X 坐标
   * @param {number} eyeY 视点的 Y 坐标
   * @param {number} eyeZ 视点的 Z 坐标
   * @param {number} centerX 视线目标的 X 坐标
   * @param {number} centerY 视线目标的 Y 坐标
   * @param {number} centerZ 视线目标的 Z 坐标
   * @param {number} upX 上方向向量的 X 轴分量
   * @param {number} upY 上方向向量的 Y 轴分量
   * @param {number} upZ 上方向向量的 Z 轴分量
   * @return {Matrix4} 返回实例本身
   * */
  lookAt(
    eyeX: number, eyeY: number, eyeZ: number,
    centerX: number, centerY: number, centerZ: number,
    upX: number, upY: number, upZ: number
  ) {
    return this.multiply(new Matrix4().setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ));
  }
}
