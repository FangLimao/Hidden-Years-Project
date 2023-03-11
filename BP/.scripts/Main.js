import {
  ActionFormData,
  MessageFormData,
  ModalFormData
} from '@minecraft/server-ui';
import { world } from '@minecraft/sever';

function WelcomeUI() {

  let welcome_ui = new MessageFormData()
  welcome_ui = welcome_ui.title("欢迎！")
  welcome_ui.show('player')

}
world.events.beforeChat.subscribe(async (eventData) => {
  const player = eventData.sender;
  switch (eventData.message) {
    case '#about':
      eventData.cancel = true;
      await world.events.subscribe(WelcomeUI)
    default: break;
  }
});