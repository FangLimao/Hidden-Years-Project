import {
  ActionFormData,
  MessageFormData,
  ModalFormData
} from "@minecraft/server-ui";

let about_ui = new ActionFormData();
about_ui.title("关于")
about_ui.button("确定")
about_ui.show(player)
