import { message } from "antd";
import { ImportedDataState } from "./type";

export const ideas = ["Brother", "Parent"];
export const defaultIdeasCheckedList = ["Brother", "Parent"];
export const context = ["Brother", "Parent"];
export const defaultContextCheckedList = ["Brother", "Parent"];
export const content = ["Brother", "Parent"];
export const defaultContentCheckedList = ["Brother", "Parent"];

export const loadFromJSON = async (): Promise<ImportedDataState> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data as ImportedDataState);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  });
};

export const loadFromMM = async (): Promise<File> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".mm";

    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }
      resolve(file);
    };

    input.click();
  });
};

export const restoreData = (dataState: ImportedDataState) => {
  const storageData = localStorage.getItem("mindMapData");
  if (storageData) {
    const mindData = JSON.parse(storageData);

    let count = 0;

    for (let i = 0; i < mindData.length; i++) {
      if (mindData[i].projectName === dataState.projectName) {
        count++;
      }
    }

    if (count > 0) {
      message.error({
        content: "Duplicate Project Name",
      });
      return false;
    } else {
      mindData.unshift(dataState); // Pushing the loaded project to the first item
      localStorage.setItem("mindMapData", JSON.stringify(mindData));
      window.dispatchEvent(new Event("projectChanged"));

      return true;
    }
  }
};
