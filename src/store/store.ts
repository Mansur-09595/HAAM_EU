// Импортируем функции из Redux Toolkit и redux-persist
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // используем localStorage
import { combineReducers } from 'redux'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
// Импортируем наш rootReducer (в нём будут все наши слайсы)
import { rootReducer } from './rootReducer'

// Настройки для сохранения данных
const persistConfig = {
    key: 'root', // имя хранилища в localStorage
    storage, // используем localStorage
    whitelist: ['favorites', 'ads',  'auth', 'categories', 'adsByCategory', 'users', 'cities' ], // Укажем, какие редьюсеры сохранять
}

// Создаём редьюсер с возможностью сохранять данные
const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer))

// Создаём сам store (главное хранилище Redux)
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,// отключаем проверку, чтобы persist работал без ошибок
    }),
})

// Создаём persistor, чтобы восстанавливать store после перезагрузки
export const persistor = persistStore(store)

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
// Хуки для удобной работы в компонентах
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
