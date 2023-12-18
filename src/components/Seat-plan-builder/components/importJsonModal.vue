<template>
    <AppModal :title="'Import Json'" :visible="show" @close="hideModal">
        <template v-slot:content>
            <div class="flex justify-center items-center w-100">
                <input class="custom-file-input" type="file" ref="fileInput" accept="application/json"
                    @change="handleFileUpload">
            </div>
        </template>
    </AppModal>
</template>

<script>
import AppModal from '@/components/common/AppModal.vue';

import iconGlassMartini from '@/assets/images/icon/svg/icon-glass-martini.svg'
import iconSignOut from '@/assets/images/icon/svg/icon-sign-out.svg'
import iconKnife from '@/assets/images/icon/svg/icon-knife.svg'
import iconSmoking from '@/assets/images/icon/svg/icon-smoking.svg'
import iconWheelchair from '@/assets/images/icon/svg/icon-wheelchair.svg'
import iconMusic from '@/assets/images/icon/svg/icon-music.svg'
import iconPlusSquare from '@/assets/images/icon/svg/icon-plus-square.svg'
import iconInfoCircle from '@/assets/images/icon/svg/icon-info-circle.svg'
import iconMicrophone from '@/assets/images/icon/svg/icon-microphone.svg'
import iconSeat from '@/assets/images/icon/svg/icon-seat.svg';
import iconStanding from '@/assets/images/icon/svg/icon-standing.svg';

export default {
    name: 'importJsonModal',
    inject: ['layersArray'],
    components: {
        AppModal
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            json: '',
            icons: {
                iconGlassMartini: iconGlassMartini,
                iconSignOut: iconSignOut,
                iconKnife: iconKnife,
                iconSmoking: iconSmoking,
                iconWheelchair: iconWheelchair,
                iconMusic: iconMusic,
                iconPlusSquare: iconPlusSquare,
                iconInfoCircle: iconInfoCircle,
                iconMicrophone: iconMicrophone,
                iconSeat: iconSeat,
                iconStanding: iconStanding
            }
        }
    },
    methods: {
        async handleFileUpload(event) {
            if (event.target.files[0].type !== 'application/json') {
                this.$store.dispatch('notification', {
                    status: true,
                    type: 'warning',
                    message: "Only JSON file is allowed",
                });
                return;
            }
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    let fileContent = JSON.parse(reader.result);
                    // console.log(fileContent);
                    for (const i in fileContent) {
                        if (fileContent.hasOwnProperty.call(fileContent, i)) {
                            let element = fileContent[i];
                            if (element.layerConfig.objectData?.type === 'Icon') {
                                const image = new window.Image();
                                image.src = this.icons[element.layerConfig.objectData.imageName];
                                image.onload = () => {
                                    // set image only when it is loaded
                                    element.layerConfig.objectData.image = image;
                                    element.shapes[0].image = image;
                                };
                            }
                        }

                    }
                    this.hideModal();
                    setTimeout(() => {
                        this.layersArray.length = 0;
                        this.layersArray.push(...fileContent);

                    }, 1000)
                } catch (error) {
                    // console.error('Error parsing JSON file:', error);
                }
            };
            reader.readAsText(file);
        },
        hideModal() {
            this.$emit('hideModal');
        },
    }
}
</script>