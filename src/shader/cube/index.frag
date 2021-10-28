precision mediump float;

uniform sampler2D f_Sampler;
uniform sampler2D r_Sampler;
uniform sampler2D u_Sampler;
uniform sampler2D l_Sampler;
uniform sampler2D d_Sampler;
uniform sampler2D b_Sampler;
varying vec2 v_TexCoord;
// 标记每个面 0-f 1-r 2-u 3-l 4-d 5-b
uniform int u_Face;

void main() {
    if (u_Face == 0) {
        gl_FragColor = texture2D(f_Sampler, v_TexCoord);
    } else if (u_Face == 1) {
        gl_FragColor = texture2D(r_Sampler, v_TexCoord);
    } else if (u_Face == 2) {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    } else if (u_Face == 3) {
        gl_FragColor = texture2D(l_Sampler, v_TexCoord);
    } else if (u_Face == 4) {
        gl_FragColor = texture2D(d_Sampler, v_TexCoord);
    } else {
        gl_FragColor = texture2D(b_Sampler, v_TexCoord);
    }
}
