export interface data {
  id: string;
  isroot: boolean;
  parentId: string;
  topic: string;
}

export interface ImportedDataState {
  data: data[];
  format: string;
  projectName: string;
  meta: meta;
}

export interface meta {
  name: string;
  author: string;
  version: string;
}
