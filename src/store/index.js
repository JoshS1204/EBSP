import Vuex from "vuex";
import notification from "../store/notification/notification";
import loader from "../store/loader/loader";
import event from "../store/event/event";
import invitation from "../store/invitation/invitation";
import seatMapBuilderStore from "./seat-map-builder/seatMapbuilder";

export default new Vuex.Store({
  modules: {
    notification,
    event,
    seatMapBuilderStore,
    invitation,
    loader
  },
});