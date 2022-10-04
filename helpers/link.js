export const getDriveDownloadLink = (previewLink) => {
    const linkId = previewLink.match(/(?<=\/d\/).*(?=\/)/)[0];
    return createDriveLink(linkId);
}
export const createDriveLink = (id) => {
    return `https://drive.google.com/uc?id=${id}&authuser=0&export=download`;
}
