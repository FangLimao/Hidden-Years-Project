import {
  ActionFormData,
  MessageFormData,
  ModalFormData
} from "@minecraft/server-ui";

function WelcomeUi() {

  let welcome_ui = new MessageFormData()
  welcome_ui = welcome_ui.title("欢迎！")
  welcome_ui.show('player')

}