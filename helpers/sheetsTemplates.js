export const getSheetsSongArray = (obj) => {
    const array = [];
    array.push(obj.title || "");
    array.push(obj.gtp && obj.gtp || "");
    array.push(obj.pdf1_title || "");
    array.push(obj.pdf1_file || "");
    array.push(obj.pdf2_title || "");
    array.push(obj.pdf2_file || "");
    array.push(obj.pdf3_title || "");
    array.push(obj.pdf3_file || "");
    array.push(obj.pdf4_title || "");
    array.push(obj.pdf4_file || "");
    array.push(obj.pdf5_title || "");
    array.push(obj.pdf5_file || "");
    array.push(obj.words || "");
    return array;
}
