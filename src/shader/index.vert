attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
uniform mat4 u_MvpMatrix;

void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;
}
