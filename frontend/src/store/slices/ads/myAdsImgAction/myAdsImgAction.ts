// src/store/slices/ads/myAdsImgAction/myAdsImgAction.ts

import { createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:8000/api";  // базовый путь до DRF

interface ErrorResponse {
  detail?: string;
}

export const addListingImage = createAsyncThunk<
  { id: number; image: string; is_primary: boolean; created_at: string },
  { formData: FormData },
  { rejectValue: string }
>(
  "ads/addListingImage",
  async ({ formData }, { rejectWithValue }) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return rejectWithValue("Пожалуйста, войдите, чтобы добавить изображение");
    }

    // Правильный URL: /api/listings/images/
    const res = await fetch(`${API_BASE}/listings/images/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type не ставим: браузер сам добавит multipart/form-data
      },
      body: formData,
    });

    // Если ответ не в диапазоне 2xx — обрабатываем ошибку
    if (!res.ok) {
      let errorText: string;
      try {
        // DRF часто возвращает JSON вида { "detail": "…" }
        const dataErr = await res.json();
        errorText = (dataErr as ErrorResponse).detail || JSON.stringify(dataErr);
      } catch {
        // Если тело ответа не JSON (например, HTML-страница 401/403)
        errorText = `Ошибка сервера: ${res.status} ${res.statusText}`;
      }
      return rejectWithValue(errorText);
    }

    // Если всё ок, пытаемся распарсить JSON
    let data: unknown;
    try {
      data = await res.json();
    } catch (err) {
      console.error("Не удалось распарсить JSON при addListingImage:", err);
      return rejectWithValue("Неверный формат ответа от сервера при добавлении изображения");
    }

    // Ожидаем, что сервер вернёт { id, image, is_primary, created_at }
    return data as { id: number; image: string; is_primary: boolean; created_at: string };
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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return rejectWithValue("Пожалуйста, войдите, чтобы удалить изображение");
    }

    // URL: /api/listings/images/{imageId}/
    const res = await fetch(`${API_BASE}/listings/images/${imageId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let errorText: string;
      try {
        // иногда DRF отдаёт JSON { "detail": "…" }
        const dataErr = await res.json();
        errorText = (dataErr as ErrorResponse).detail || JSON.stringify(dataErr);
      } catch {
        // Может вернуться HTML-страница ошибки
        errorText = `Ошибка при удалении: ${res.status} ${res.statusText}`;
      }
      return rejectWithValue(errorText);
    }

    // Если 204 или 200, просто возвращаем imageId
    return imageId;
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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return rejectWithValue("Пожалуйста, войдите, чтобы обновить изображение");
    }

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    if (typeof is_primary === "boolean") {
      formData.append("is_primary", is_primary ? "true" : "false");
    }

    // URL: /api/listings/images/{id}/
    const res = await fetch(`${API_BASE}/listings/images/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      let errorText: string;
      try {
        const dataErr = await res.json();
        errorText = (dataErr as ErrorResponse).detail || JSON.stringify(dataErr);
      } catch {
        errorText = `Ошибка сервера: ${res.status} ${res.statusText}`;
      }
      return rejectWithValue(errorText);
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch (err) {
      console.error("Не удалось распарсить JSON при updateListingImage:", err);
      return rejectWithValue("Неверный формат ответа от сервера при обновлении изображения");
    }

    return data as { id: number; image: string; is_primary: boolean; created_at: string };
  }
);
