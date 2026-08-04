import { create } from "zustand";
import { combine, persist } from "zustand/middleware";
import { Account } from "../typescript/Account";

export const useAccountStore = create(
    persist(
        combine(
            {
                account: undefined as undefined | null | Account,
            },
            (set) => ({
                setAccount: (account: Account | null) => set({ account }),
            })
        ),
        { name: 'account' }
    )
);

interface StoreUuidState {
    selectedId: string | null;
    addId: (id: string) => void;
}

export const useStoreUuid = create(
    persist<StoreUuidState>(
        (set) => ({
            selectedId: null,
            addId: (id) => set({ selectedId: id }),
        }),
        {
            name: "entreprise-uuid",
        }
    )
);