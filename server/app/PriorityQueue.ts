import type { Item, PriorityItem } from "./helpers.js";

export interface PriorityQueue {
	insert(item: Item): void;
  remove(id: number): void;
  list: () => PriorityItem[],
	peek(): Item | null;
	pop(): Item | null;
	size(): number;
	isEmpty(): boolean;
  copy: (priorityItems: PriorityItem[]) => PriorityQueue,
}

export const priorityQueue = (): PriorityQueue => {
	let data: PriorityItem[] = [];

	return {
		insert: (item: Item) => {
      const priority = data.reduce((count, current) => current[1].name === item.name ? count + 1 : count, 0)
      
			if (data.length === 0) {
				data.push([priority, item]);
				return;
			}

			for (let idx = 0; idx < data.length; idx += 1) {
        if (data[idx][0] > priority) {
					data.splice(idx, 0, [priority, item]);

					return;
				}

				if (idx === data.length - 1) {
					data.push([priority, item]);

					return;
				}
			}
		},

    remove: (id: number) => {
      const idx = data.findIndex(x => x[1].id === id);

      if (idx === -1) {
        return;
      }

      data.splice(idx, 1);
    },

    list: (): PriorityItem[] => data,

    isEmpty: () => data.length === 0,

    peek: () => data.length === 0 ? null : data[0][1],

    pop: () => data.length === 0 ? null : data.pop()![1],

    size: () => data.length,

    copy(items) {
      data = [...items];

      return this;
    }
	};
};
