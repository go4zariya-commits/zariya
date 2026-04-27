// ============================================================
// ZARIYA BOUTIQUE — Google Apps Script
// Deploy as a Web App (anyone can access, no sign-in required)
// ============================================================
// STEP 1: Open script.google.com
// STEP 2: Paste this entire file
// STEP 3: Click Deploy > New Deployment > Web App
//         - Execute as: Me
//         - Who has access: Anyone
// STEP 4: Copy the Web App URL into js/config.js on your site
// ============================================================

// Map each page name to the exact Google Drive folder name
const FOLDER_MAP = {
  "straight-suits":  "Zariya - Straight Suits",
  "anarkali":        "Zariya - Anarkali",
  "long-kurtis":     "Zariya - Long Kurtis",
  "short-kurtis":    "Zariya - Short Kurtis",
  "aline-suits":     "Zariya - A-line Suits",
  "party-wear":      "Zariya - Party Wear",
};

function doGet(e) {
  const category = e.parameter.category;

  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  // Allow CORS so GitHub Pages can fetch this
  const headers = {
    "Access-Control-Allow-Origin": "*",
  };

  try {
    if (!category || !FOLDER_MAP[category]) {
      // Return all categories index
      const index = Object.keys(FOLDER_MAP).map(key => ({
        id: key,
        label: FOLDER_MAP[key].replace("Zariya - ", ""),
        url: `?category=${key}`
      }));
      output.setContent(JSON.stringify({ categories: index }));
      return output;
    }

    const folderName = FOLDER_MAP[category];
    const folders = DriveApp.getFoldersByName(folderName);

    if (!folders.hasNext()) {
      output.setContent(JSON.stringify({ error: `Folder "${folderName}" not found`, images: [] }));
      return output;
    }

    const folder = folders.next();
    const files = folder.getFiles();
    const images = [];

    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getMimeType();

      // Only include image files
      if (mimeType.startsWith("image/")) {
        // Make file publicly readable (view only)
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        const id = file.getId();
        images.push({
          id: id,
          name: file.getName().replace(/\.[^.]+$/, ""), // strip extension for caption
          // Direct thumbnail URL — works without sign-in
          url: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
          fullUrl: `https://drive.google.com/file/d/${id}/view`,
        });
      }
    }

    output.setContent(JSON.stringify({
      category: category,
      label: folderName.replace("Zariya - ", ""),
      count: images.length,
      images: images,
    }));

  } catch (err) {
    output.setContent(JSON.stringify({ error: err.message, images: [] }));
  }

  return output;
}
