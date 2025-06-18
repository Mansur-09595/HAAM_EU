import adsReducer from './slices/ads/adsSlice'
import favoritesReducer from './slices/favorites/favoritesSlice'
import authReducer from './slices/auth/authSlice'
import categoriesReducer from './slices/categories/categoriesSlice'
import adsByCategoryReducer from './slices/categories/extracted/adsByCategorySlice'
import usersReducer from './slices/auth/users/usersSlice'
import citiesReducer from './slices/cities/citiesSlice'
import myAdsReducer from './slices/ads/myAdsAction/myAdsSlice'
import myAdsImgReducer from './slices/ads/myAdsImgAction/myAdsImgSlice'
import chatReducer from './slices/chat/chatSlice'
import notificationsReducer from './slices/notifications/notificationsSlice'

export const rootReducer = {
  favorites: favoritesReducer,
  ads: adsReducer,
  auth: authReducer,
  categories: categoriesReducer,
  adsByCategory: adsByCategoryReducer,
  users: usersReducer,
  cities: citiesReducer,
  myads: myAdsReducer,
  myadsimg: myAdsImgReducer,
  chat: chatReducer,
  notifications: notificationsReducer,
}
