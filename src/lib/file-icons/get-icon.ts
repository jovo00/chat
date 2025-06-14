import { getFileExtension } from "@/lib/utils";
import { iconMap } from "./icon-map";

export default function getIcon(filenameOrLanguage: string | undefined, folder: boolean) {
  if (filenameOrLanguage === undefined)
    return folder ? `/material-icons/${iconMap.defaultFolder}.svg` : `/material-icons/${iconMap.defaultFile}.svg`;

  const file = getFileExtension(filenameOrLanguage.toLowerCase());

  let icon = null;

  let iconFound = undefined;
  if (folder) {
    iconFound = (iconMap.folders as { [key: string]: string })[file.name ?? ""];
  } else {
    iconFound = (iconMap.files as { [key: string]: string })[file.name + "." + file.extension];

    if (!iconFound && file.extension) {
      iconFound = (iconMap.fileExtensions as { [key: string]: string })[file.extension ?? ""];
    }

    if (!iconFound) {
      iconFound =
        (iconMap.languages as { [key: string]: string })[filenameOrLanguage] ??
        (iconMap.fileExtensions as { [key: string]: string })[filenameOrLanguage];
    }
  }

  if (iconFound) {
    icon = `/material-icons/${iconFound}.svg`;
  }

  if (!icon) {
    icon = folder ? `/material-icons/${iconMap.defaultFolder}.svg` : `/material-icons/${iconMap.defaultFile}.svg`;
  }

  return icon;
}
