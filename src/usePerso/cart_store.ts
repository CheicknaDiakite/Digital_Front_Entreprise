import { create } from "zustand";

interface CartState {
    selectedIds: Set<number>;
    sorties: any[];
    categories: any[];
    souscategories: any[];
}

interface CartActions {
    toggleId: (id: number) => void;
    selectAllIds: (ids: number[]) => void;
    reset: () => void;
    setSorties: (sorties: any[]) => void;
    setCategories: (categories: any[]) => void;
    setSousCategories: (souscategories: any[]) => void;
}

const initialState: CartState = {
    selectedIds: new Set(),
    sorties: [],
    categories: [],
    souscategories: [],
};

export const useStoreCart = create<CartState & CartActions>((set) => ({
    ...initialState,

    setSorties: (sorties) => set({ sorties }),
    setCategories: (categories) => set({ categories }),
    setSousCategories: (souscategories) => set({ souscategories }),

    toggleId(id) {
        set((state) => {
            const newIds = new Set(state.selectedIds);
            if (newIds.has(id)) {
                newIds.delete(id);
            } else {
                newIds.add(id);
            }
            return { selectedIds: newIds };
        });
    },

    selectAllIds(ids: number[]) {
        set({ selectedIds: new Set(ids) });
    },

    reset() {
        set({ ...initialState, selectedIds: new Set() });
    },
}));