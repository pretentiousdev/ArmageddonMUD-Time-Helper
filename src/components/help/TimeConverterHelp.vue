<template>
    <div>
        <p>The Time Converter tab displays the OOC time and IC time for a selected date.
            When the application starts, the selected time will be the current time.
        </p>
        <p>OOC Time: The OOC time will be displayed for your timezone at the top.
            The format in which it is displayed can be adjusted by clicking the <el-button>Settings</el-button> button in the upper
            right while on the Time Converter tab under the OOC Date Format section. There's also an option
            in the settings to display server time. When checked, the server time will be displayed above
            the time for your current timezone.
        </p>
        <p>
            IC Time: Underneath the OOC time is the IC time for the selected time. You can set the IC time to be
            'editable' in the settings, which allows you to change the selected time by setting the hour, day, month,
            or year of displayed IC time.
        </p>
        <p>
            Relative IC time: Underneath the IC time is how long in IC terms the selected time is from the current time.
        </p>
        <p><el-button>+Event</el-button>: This will open a window to create a new event with the selected time.
            The time can be changed in the 'New Event' window.
        </p>
        <p><el-button-group>
            <el-button>
              Next Dawn
            </el-button>
            <el-button>
              <ion-icon name="alarm-outline" style="font-size:20px;"></ion-icon>
            </el-button>
          </el-button-group>: Clicking 'Next Dawn' will set the time to when it will next be dawn IC. Clicking on the alarm clock icon will set an alarm for the next dawn.</p>
        <p><el-button>Stop time at now.</el-button> stops the selected date from following along with the current time.
        <el-button>Follow current time.</el-button> makes the selected time follow the current time again.</p>
        <p><el-button>From IC</el-button> brings up a window that you can paste the IC time (as displayed by the 'time' command in game) into it, and it will set the time from that.</p>
        <p><el-button>Adjust IC</el-button> Adjusts the date in increments of IC time (hours/days/weeks/months/years/ages).</p>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>