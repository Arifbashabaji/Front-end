import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messageSignal = signal<string | null>(null);

  /**
   * Sets a message to be displayed. This message is intended to be consumed once.
   * @param message The message string to display.
   */
  setMessage(message: string) {
    this.messageSignal.set(message);
  }

  /**
   * Retrieves the message and immediately clears it to prevent it from being shown again.
   * @returns The message string if one exists, otherwise null.
   */
  getMessage(): string | null {
    const message = this.messageSignal();
    this.messageSignal.set(null); // Clear the message after it has been retrieved
    return message;
  }
}
