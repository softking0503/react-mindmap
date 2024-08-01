declare module "jsmind" {
  interface Options {
    container: string;
    editable?: boolean;
    theme?: string;
  }

  interface Node {
    id: string;
    isroot?: boolean;
    parentid?: string;
    topic: string;
  }

  interface Mind {
    meta: {
      name: string;
      author: string;
      version: string;
    };
    format: string;
    data: Node[];
  }

  class jsMind {
    constructor(options: Options);
    show(mind: Mind): void;
    get_selected_node(): Node | null;
    add_node(parentNode: Node, id: string, topic: string): void;
    remove_node(id: string): void;
    get_data(): Mind;
  }

  export = jsMind;
}
