import { createAsyncThunk } from "@reduxjs/toolkit";
import { TokenManager } from "@/utils/tokenUtils";
import { AuthErrorHandler } from "@/utils/authErrorHandler";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://haam-db.onrender.com/api"; 

export const addListingImage = createAsyncThunk<
  { id: number; image: string; is_primary: boolean; created_at: string },
  { formData: FormData },
  { rejectValue: string }
>(
  "ads/addListingImage",
  async ({ formData }, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/images/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res);
        return rejectWithValue(msg);
      }

      let data: unknown;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Не удалось распарсить JSON при addListingImage:", err);
        return rejectWithValue("Неверный формат ответа от сервера при добавлении изображения");
      }

      return data as { id: number; image: string; is_primary: boolean; created_at: string };
    } catch {
      return rejectWithValue("Ошибка подключения");
    }
  }
);

//2) Удаление существующего изображения (DELETE /api/listings/images/{id}/)
export const deleteListingImage = createAsyncThunk<
  number,                // вернёт просто ID удалённой картинки
  { imageId: number },   // передаём ID картинки
  { rejectValue: string }
>(
  "ads/deleteListingImage",
  async ({ imageId }, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/images/${imageId}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res);
        return rejectWithValue(msg);
      }

      return imageId;
    } catch {
      return rejectWithValue("Ошибка подключения");
    }
  }
);

//3) Обновление существующего изображения (PATCH /api/listings/images/{id}/)
export const updateListingImage = createAsyncThunk<
  { id: number; image: string; is_primary: boolean; created_at: string },
  { id: number; imageFile?: File; is_primary?: boolean },
  { rejectValue: string }
>(
  "ads/updateListingImage",
  async ({ id, imageFile, is_primary }, { rejectWithValue }) => {
    // Собираем FormData: будем включать только те поля, что переданы
    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (typeof is_primary === "boolean") {
      formData.append("is_primary", is_primary ? "true" : "false");
    }

    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/listings/images/${id}/`, {
        method: "PATCH",
        body: formData,
      });

      let data: unknown;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Не удалось распарсить JSON при updateListingImage:", err);
        return rejectWithValue("Неверный формат ответа от сервера при обновлении изображения");
      }

      if (!res.ok) {
        const errObj = data as { detail?: string };
        const msg = errObj.detail || (await AuthErrorHandler.handle(res));
        return rejectWithValue(msg);
      }

      return data as {
        id: number;
        image: string;
        is_primary: boolean;
        created_at: string;
      };
    } catch {
      return rejectWithValue("Ошибка подключения");
    }
  }
);
