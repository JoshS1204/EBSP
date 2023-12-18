<template>
    <Teleport to="body">
        <AppDrawer :title="'Configure Individual Rows'" :visible="visible" @close="closeDrawer">
            <template v-slot:content>
                <div class="flex flex-col h-100">
                    <div class="grow h-100 drawer-content-scroll-small scroll-y sb--149">

                      <div class="individual-row-wrap">
                        <div class="individual-row-head">
                          <label for="inputIndividualRow" class="form-label text-sm">Row</label>
                          <KInput min="1" max="100" type="text" :size="'large'" id="inputIndividualRow" placeholder="A" />
                        </div>
                        <div class="individual-row-content">
                          <div class="row">
                            <div class="col-6">
                              <label for="inputIndividualRow2" class="form-label text-sm">Number of seats</label>
                              <KInput min="1" max="100" type="text" :size="'large'" id="inputIndividualRow2" placeholder="A" />
                            </div>
                            <div class="col-6">
                              <label for="inputIndividualRow3" class="form-label text-sm">Row starts with</label>
                              <KInput min="1" max="100" type="text" :size="'large'" id="inputIndividualRow3" placeholder="A" />
                            </div>
                          </div>
                          <div class="offer-row">
                            <span class="text-sm primary10">Offer Row</span>
                          </div>
                        </div>
                      </div>

                      <div class="individual-row-wrap mt-3">
                        <div class="individual-row-head">
                          <label for="inputIndividualRow4" class="form-label text-sm">Row</label>
                          <KInput min="1" max="100" type="text" :size="'large'" id="inputIndividualRow4" placeholder="A" />
                        </div>
                        <div class="individual-row-content">
                          <div class="row">
                            <div class="col-6">
                              <label for="inputIndividualRow5" class="form-label text-sm">Number of seats</label>
                              <KInput min="1" max="100" type="text" :size="'large'" id="inputIndividualRow5" placeholder="A" />
                            </div>
                            <div class="col-6">
                              <label for="inputIndividualRow6" class="form-label text-sm">Row starts with</label>
                              <KInput min="1" max="100" type="text" :size="'large'" id="inputIndividualRow6" placeholder="A" />
                            </div>
                          </div>
                          <div class="offer-row2">
                            <div class="text-sm primary10">Offer Row</div>
                            <div class="btn-group-cst">
                              <kbutton :fill-mode="'outline'" :size="'large'" :class="''">
                                <span class="k-icon k-font-icon k-i-arrow-chevron-left k-icon-md"></span>
                              </kbutton>
                              <kbutton :fill-mode="'outline'" :size="'large'" :class="''">
                                <span class="k-icon k-font-icon k-i-arrow-chevron-right k-icon-md"></span>
                              </kbutton>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                </div>
            </template>
        </AppDrawer>
    </Teleport>
</template>
  
<script>
import { Button } from "@progress/kendo-vue-buttons";
import { Checkbox, Input } from "@progress/kendo-vue-inputs";
import iconDeleteBlack from '@/assets/images/icon/svg-icons/iconDeleteBlack.vue'
import AppDrawer from "../../../../common/AppDrawer.vue";
import { Teleport } from 'vue';

export default {
    name: 'configIndividualRows',
    inject: ["layersArray"],
    components: {
        AppDrawer,
        iconDeleteBlack,
        kbutton: Button,
        KInput: Input,
        checkbox: Checkbox,
        Teleport,
    },
    data() {
        return {
        }
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
    },
    mounted() { },
    methods: {
        closeDrawer() {
            this.$emit('close');
        }
    }
}
</script>