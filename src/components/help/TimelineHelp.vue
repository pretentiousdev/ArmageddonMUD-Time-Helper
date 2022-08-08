<template>
    <p>
        Timeline is a way of displaying events to easily see the time between them.
    </p>
    <p>
        To view a Timeline, you first need to load events onto it. You can load events
        from the pinned events, or from search results on the Events tab.
    </p>
    <p>
        An event on a timeline will only display its title. You can see the full details of the event by clicking the
        view button
        <el-button>
            <el-icon size="18px">
                <View />
            </el-icon>
        </el-button>
        . Above the event's title, you'll see the difference in (IC) time between it and the displayed event above it.
    </p>

    <el-timeline>
        <el-timeline-item center placement="top">
            <el-card>
                <table style="width:100%">
                    <tr>
                        <td style="width:20%"></td>
                        <td>Joined the Byn</td>
                        <td style="width:20%">
                            <el-button size="small" style=" margin-right:5px;">
                                <el-icon size="18px">
                                    <Hide />
                                </el-icon>
                            </el-button>
                            <el-button size="small" style=" margin-right:10px;">
                                <el-icon size="18px">
                                    <View />
                                </el-icon>
                            </el-button>
                        </td>
                    </tr>
                </table>
            </el-card>
        </el-timeline-item>
        <el-timeline-item center timestamp="1 year, 1 month, 5 days (IC)" placement="top">
            <el-card>
                <table style="width:100%">
                    <tr>
                        <td style="width:20%"></td>
                        <td>Promoted to Trooper</td>
                        <td style="width:20%">
                            <el-button size="small" style=" margin-right:5px;">
                                <el-icon size="18px">
                                    <Hide />
                                </el-icon>
                            </el-button>
                            <el-button size="small" style=" margin-right:10px;">
                                <el-icon size="18px">
                                    <View />
                                </el-icon>
                            </el-button>
                        </td>
                    </tr>
                </table>
            </el-card>
        </el-timeline-item>
        <el-timeline-item center timestamp="2 years, 1 month, 9 days (IC)" placement="top">
            <el-card>
                <table style="width:100%">
                    <tr>
                        <td style="width:20%"></td>
                        <td>Promoted to First Trooper</td>
                        <td style="width:20%">
                            <el-button size="small" style=" margin-right:5px;">
                                <el-icon size="18px">
                                    <Hide />
                                </el-icon>
                            </el-button>
                            <el-button size="small" style=" margin-right:10px;">
                                <el-icon size="18px">
                                    <View />
                                </el-icon>
                            </el-button>
                        </td>
                    </tr>
                </table>
            </el-card>
        </el-timeline-item>
    </el-timeline>
    <p>
        In the example above, you can see that the time between the event 'Joined the Byn' and 'Promoted to Trooper'
        is 1 year, 1 month, 5 days (IC). The time between 'Promoted to Trooper' and 'Promoted to Sergeant' is
        2 years, 1 month, 9 days (IC). If you wanted to see the time between 'Joined the Byn' and 'Promoted to
        Sergeant',
        you'd click the hide button
        <el-button size="small" style=" margin-right:5px;">
            <el-icon size="18px">
                <Hide />
            </el-icon>
        </el-button>
        for 'Promoted to Trooper'. (Will not work in the example).
    </p>
</template>

<script setup lang="ts">

</script>

<style scoped>
</style>