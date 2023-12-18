<template>
    <NotificationGroup v-if="notifications.length !== 0" :style="{
        left: '40%',
        top: 5,
        alignItems: 'flex-start',
        flexWrap: 'wrap-reverse'
    }">
        <Fade  v-for="(notification, index) of notifications" :key="index"  :appear="notification.status" >
            <Notification :type="{
                style: notification.type,
            }">
                <span>{{notification.message}}</span>
            </Notification>
        </Fade>
    </NotificationGroup>
</template>

<script>
import { Fade } from '@progress/kendo-vue-animation'
import { Notification, NotificationGroup } from '@progress/kendo-vue-notification'

export default {
    name: 'AppNotification',
    components: {
        Fade,
        Notification,
        NotificationGroup
    },
    computed: {
        notifications() {
            return this.$store.state.notification.notifications;
        }
    },
    methods: {}
}
</script>
