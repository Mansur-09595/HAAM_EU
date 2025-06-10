import { TokenManager } from "./tokenUtils";

export class AuthErrorHandler {
  static isAuthError(status: number): boolean {
    return status === 401 || status === 403;
  }

  static getMessage(status: number): string {
    switch (status) {
      case 401:
        return 'Пожалуйста, войдите в систему';
      case 403:
        return 'У вас нет прав для выполнения этого действия';
      default:
        return `Ошибка авторизации (${status})`;
    }
  }

  static async handle(response: Response): Promise<string> {
    if (this.isAuthError(response.status)) {
      if (response.status === 401) TokenManager.clearTokens();
      return this.getMessage(response.status);
    }
    try {
      const data = await response.json();
      return (data as { detail?: string; message?: string }).detail || data.message || response.statusText;
    } catch {
      return response.statusText;
    }
  }
}