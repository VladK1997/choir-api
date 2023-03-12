export const getSheetsSongArray = (obj) => {
    return [
        obj.title || "",
        obj.gtp && obj.gtp || "",
        obj.pdf1_title || "",
        obj.pdf1_file || "",
        obj.pdf2_title || "",
        obj.pdf2_file || "",
        obj.pdf3_title || "",
        obj.pdf3_file || "",
        obj.pdf4_title || "",
        obj.pdf4_file || "",
        obj.pdf5_title || "",
        obj.pdf5_file || "",
        obj.words || "",
    ];
}
