import numpy as np


def coord_string(a, b):
    s = [0] * (len(a) * 2)
    for i in range(len(s)):
        s[i] = str(a[i/2]) if i % 2 == 0 else str(b[i/2])
    return ",".join(s)


def vert_builder():
    start_vertices = [int(x) for x in "179,322,179,525,355,624,530,525,530,322,355,216".split(",")]

    hex_width = start_vertices[8] - start_vertices[0]
    hex_height = start_vertices[5] - start_vertices[-1]
    
    x_offset = start_vertices[-2] - start_vertices[0]
    y_offset = start_vertices[5] - start_vertices[3]

    x_coords = np.array(start_vertices[0::2])
    y_coords = np.array(start_vertices[1::2])

    x_coords += x_offset - hex_width
    y_coords += - (hex_height - y_offset)

    verts = []

    for cols in range(8):
        for rows in range(8):
            xvs = x_coords + rows * hex_width
            yvs = y_coords + cols * (hex_height - y_offset)

            if cols % 2 == 1:
                xvs -= x_offset

            xvs = in_bound(xvs, 'x')
            yvs = in_bound(yvs, 'y')

            verts.append(coord_string(xvs, yvs))

    return verts



def in_bound(arr, flag):
    _min = 0
    _max = 3300
    if flag == 'x':
        _max = 2550

    def h(x, m, M):
        if x < m:
            return 0
        elif x > M:
            return M
        return x
    
    return map(lambda x: h(x, _min, _max), arr)


def hex_builder():
    verts = ["<area title=\"Hex%d\" id=\"hex%d\" coords=\"%s\" shape=\"poly\" />" % (i, i, v) for i,v in enumerate(vert_builder())]
    header = "<map name=\"arkenkor-map\">\n\t"
    footer = "\n</map>"
    body = "\n\t".join(verts)

    return header + body + footer

print coord_string([1,2,3],[4,5,6])
print hex_builder()
