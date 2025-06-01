import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { updateListingImage, addListingImage, deleteListingImage } from './myAdsImgAction' // Импортируем функции для работы с API
import { Ads } from '@/types/IAds' // Импортируем тип объявления

// Состояние для объявлений
interface myAdsImgState {
  items: Ads[]           // публичные объявления (т. е. для страницы «Все объявления»)
  myItems: Ads[]         // «мои объявления»
  selectedAd: Ads | null // для детального просмотра
  loading: boolean
  error: string | null
}

const initialState: myAdsImgState = {
  items: [],
  myItems: [],
  selectedAd: null,
  loading: false,
  error: null,
}

const myAdsImgSlice = createSlice({
    name: "myadsimg",
    initialState,
    reducers: {
      // … ваши обычные редьюсеры …
    },
    extraReducers: (builder) => {
      builder
        // ─── addListingImage ────────────────────────────────────────────────────
        .addCase(addListingImage.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(
          addListingImage.fulfilled,
          (
            state,
            action: PayloadAction<{
              id: number;
              image: string;
              is_primary: boolean;
              created_at: string;
            }>
          ) => {
            state.loading = false;
            // в ответе вернулся объект нового изображения,
            // запишем его в selectedAd.images, а также (опционально)
            // в items/myItems, если там есть соответствующий ad.
            const newImg = action.payload;
            if (state.selectedAd) {
              state.selectedAd.images = [...state.selectedAd.images, newImg];
            }
            state.items = state.items.map((ad) => {
              if (ad.slug === state.selectedAd?.slug) {
                return { ...ad, images: [...ad.images, newImg] };
              }
              return ad;
            });
            state.myItems = state.myItems.map((ad) => {
              if (ad.slug === state.selectedAd?.slug) {
                return { ...ad, images: [...ad.images, newImg] };
              }
              return ad;
            });
          }
        )
        .addCase(addListingImage.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? action.error.message ?? "Ошибка добавления изображения";
        })
  
        // ─── deleteListingImage ─────────────────────────────────────────────────
        .addCase(deleteListingImage.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteListingImage.fulfilled, (state, action: PayloadAction<number>) => {
          state.loading = false;
          const removedId = action.payload;
          // Удаляем картинку из selectedAd.images и из items/myItems
          if (state.selectedAd) {
            state.selectedAd.images = state.selectedAd.images.filter((img) => img.id !== removedId);
          }
          state.items = state.items.map((ad) => {
            return {
              ...ad,
              images: ad.images.filter((img) => img.id !== removedId),
            };
          });
          state.myItems = state.myItems.map((ad) => {
            return {
              ...ad,
              images: ad.images.filter((img) => img.id !== removedId),
            };
          });
        })
        .addCase(deleteListingImage.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? action.error.message ?? "Ошибка удаления изображения";
        })
  
        // ─── updateListingImage ─────────────────────────────────────────────────
        .addCase(updateListingImage.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(
          updateListingImage.fulfilled,
          (
            state,
            action: PayloadAction<{
              id: number;
              image: string;
              is_primary: boolean;
              created_at: string;
            }>
          ) => {
            state.loading = false;
            const updated = action.payload;
  
            // 1) Обновляем в selectedAd.images
            if (state.selectedAd) {
              state.selectedAd.images = state.selectedAd.images.map((img) =>
                img.id === updated.id
                  ? { ...img, image: updated.image, is_primary: updated.is_primary, created_at: updated.created_at }
                  : img
              );
            }
  
            // 2) Обновляем во всех объявлениях (items и myItems), если в них были такие изображения
            state.items = state.items.map((ad) => {
              if (ad.images.some((img) => img.id === updated.id)) {
                return {
                  ...ad,
                  images: ad.images.map((img) =>
                    img.id === updated.id
                      ? { ...img, image: updated.image, is_primary: updated.is_primary, created_at: updated.created_at }
                      : img
                  ),
                };
              }
              return ad;
            });
            state.myItems = state.myItems.map((ad) => {
              if (ad.images.some((img) => img.id === updated.id)) {
                return {
                  ...ad,
                  images: ad.images.map((img) =>
                    img.id === updated.id
                      ? { ...img, image: updated.image, is_primary: updated.is_primary, created_at: updated.created_at }
                      : img
                  ),
                };
              }
              return ad;
            });
          }
        )
        .addCase(updateListingImage.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload ?? action.error.message ?? "Ошибка обновления изображения";
        });
    },
  });


export default myAdsImgSlice.reducer
