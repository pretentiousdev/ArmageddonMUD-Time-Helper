export function ordinalFor(num: number) {
    let suffix = "";
    let ones = num % 10;
    let tens = Math.floor(num / 10) % 10;

    if (tens === 1) {
        suffix = "th";
    } else if (ones === 1) {
        suffix = "st";
    } else if (ones === 2) {
        suffix = "nd";
    } else if (ones === 3) {
        suffix = "rd";
    } else {
        suffix = "th";
    }

    return suffix;
}

export function withOrdinal(num: number) {
    return num + ordinalFor(num);
}

export interface relativeZalanthanTime {
    ages: number,
    years: number,
    months: number,
    weeks: number,
    days: number,
    hours: number,
    future: boolean,
    diff: number
}


export interface moonsState {
    jihae: string,
    jihaePos: "east" | "west" | "none",
    jihaeHeight: "high" | "low" | "none",
    jihaePhase: "new moon" | "gibbous" | "new crescent" | "crescent" | "full" | "half-moon" | "none",
    jihaePhaseDirection: "waxing" | "waning" | "neither",
    lirathu: string,
    lirathuPos: "east" | "west" | "none",
    lirathuHeight: "high" | "low" | "none",
    lirathuPhase: "new moon" | "gibbous" | "new crescent" | "crescent" | "full" | "half-moon" | "none",
    lirathuPhaseDirection: "waxing" | "waning" | "neither",
    blackmoon: string,
    blackmoonPos: "east" | "west" | "center" | "none",
    blackmoonHeight: "high" | "low" | "none",
}

export class ZalanthanTime {
    hour: number;
    day: number;
    month: number;
    year: number;
    age: number;

    dayInWeek: number;

    hourName: string;
    dayName: string;
    monthName: string;
    yearName: string;


    static readonly hoursInDay = [
        "before dawn",
        "dawn",
        "early morning",
        "late morning",
        "high sun",
        "early afternoon",
        "late afternoon",
        "dusk",
        "late at night",
    ];
    static readonly daysInWeek = [
        "Ocandra",
        "Terrin",
        "Abid",
        "Cingel",
        "Nekrete",
        "Waleuk",
        "Yochem",
        "Huegel",
        "Dzeda",
        "Barani",
        "Detal",
    ];
    static readonly monthsInYear = ["Descending Sun", "Low Sun", "Ascending Sun"];
    static readonly yearsInAge = [
        "Jihae's Anger",
        "Drov's Peace",
        "Desert's Vengeance",
        "Ruk's Slumber",
        "Whira's Defiance",
        "Dragon's Reverence",
        "Vivadu's Agitation",
        "King's Anger",
        "Silt's Peace",
        "Suk-krath's Vengeance",
        "Lirathu's Slumber",
        "Jihae's Defiance",
        "Drov's Reverence",
        "Desert's Agitation",
        "Ruk's Anger",
        "Whira's Peace",
        "Dragon's Vengeance",
        "Vivadu's Slumber",
        "King's Defiance",
        "Silt's Reverence",
        "Suk-krath's Agitation",
        "Lirathu's Anger",
        "Jihae's Peace",
        "Drov's Vengeance",
        "Desert's Slumber",
        "Ruk's Defiance",
        "Whira's Reverence",
        "Dragon's Agitation",
        "Vivadu's Anger",
        "King's Peace",
        "Silt's Vengeance",
        "Suk-krath's Slumber",
        "Lirathu's Defiance",
        "Jihae's Reverence",
        "Drov's Agitation",
        "Desert's Anger",
        "Ruk's Peace",
        "Whira's Vengeance",
        "Dragon's Slumber",
        "Vivadu's Defiance",
        "King's Reverence",
        "Silt's Agitation",
        "Suk-krath's Anger",
        "Lirathu's Peace",
        "Jihae's Vengeance",
        "Drov's Slumber",
        "Desert's Defiance",
        "Ruk's Reverence",
        "Whira's Agitation",
        "Dragon's Anger",
        "Vivadu's Peace",
        "King's Vengeance",
        "Silt's Slumber",
        "Suk-krath's Defiance",
        "Lirathu's Reverence",
        "Jihae's Agitation",
        "Drov's Anger",
        "Desert's Peace",
        "Ruk's Vengeance",
        "Whira's Slumber",
        "Dragon's Defiance",
        "Vivadu's Reverence",
        "King's Agitation",
        "Silt's Anger",
        "Suk-krath's Peace",
        "Lirathu's Vengeance",
        "Jihae's Slumber",
        "Drov's Defiance",
        "Desert's Reverence",
        "Ruk's Agitation",
        "Whira's Anger",
        "Dragon's Peace",
        "Vivadu's Vengeance",
        "King's Slumber",
        "Silt's Defiance",
        "Suk-krath's Reverence",
        "Lirathu's Agitation"
    ];

    static readonly daysPerWeek = 11;
    static readonly weeksPerMonth = 21;
    static readonly monthsPerYear = 3;
    static readonly yearsPerAge = 77;
    static readonly hoursPerDay = 9;
    static readonly daysPerMonth = ZalanthanTime.weeksPerMonth * ZalanthanTime.daysPerWeek;
    static readonly weeksPerYear = ZalanthanTime.weeksPerMonth * ZalanthanTime.monthsPerYear;
    static readonly daysPerYear = ZalanthanTime.daysPerMonth * ZalanthanTime.monthsPerYear;

    static readonly hourToOOCSeconds = 10 * 60;
    static readonly dayToOOCSeconds = ZalanthanTime.hourToOOCSeconds * ZalanthanTime.hoursPerDay;
    static readonly ageToOOCSeconds = ZalanthanTime.yearsPerAge * ZalanthanTime.daysPerYear * ZalanthanTime.dayToOOCSeconds;
    static readonly yearToOOCSeconds = ZalanthanTime.daysPerYear * ZalanthanTime.dayToOOCSeconds;
    static readonly monthToOOCSeconds = ZalanthanTime.daysPerMonth * ZalanthanTime.dayToOOCSeconds;
    static readonly weekToOOCSeconds = ZalanthanTime.daysPerWeek * ZalanthanTime.dayToOOCSeconds;
    static readonly dawnOfTime = new Date("1820-09-13T13:30:00.000Z");

    constructor(date: Date) {
        let timeDiff = (date.getTime() - ZalanthanTime.dawnOfTime.getTime()) / 1000;
        timeDiff = Math.floor(timeDiff / ZalanthanTime.hourToOOCSeconds);
        this.hour = timeDiff % ZalanthanTime.hoursPerDay;

        timeDiff = Math.floor(timeDiff / ZalanthanTime.hoursPerDay);
        this.day = timeDiff % ZalanthanTime.daysPerMonth;

        timeDiff = Math.floor(timeDiff / ZalanthanTime.daysPerMonth);
        this.month = timeDiff % ZalanthanTime.monthsPerYear;

        timeDiff = Math.floor(timeDiff / ZalanthanTime.monthsPerYear);
        this.year = timeDiff % ZalanthanTime.yearsPerAge;

        timeDiff = Math.floor(timeDiff / ZalanthanTime.yearsPerAge);
        this.age = timeDiff;

        this.dayInWeek = this.day % ZalanthanTime.daysPerWeek;
        this.hourName = ZalanthanTime.hoursInDay[
            this.hour % ZalanthanTime.hoursPerDay
        ];
        this.dayName = ZalanthanTime.daysInWeek[this.dayInWeek];
        this.monthName = ZalanthanTime.monthsInYear[
            this.month % ZalanthanTime.monthsPerYear
        ];
        this.yearName = ZalanthanTime.yearsInAge[
            this.year % ZalanthanTime.yearsPerAge
        ];
    };

    dateString() {
        let day = withOrdinal(this.day + 1);
        let age = withOrdinal(this.age + 1);
        let s =
            "It is " +
            this.hourName +
            " on " +
            this.dayName +
            ", " +
            day +
            " day of the " +
            this.monthName +
            ",<br />In the Year of " +
            this.yearName +
            ", year " +
            (this.year + 1) +
            " of the " +
            age +
            " Age.";
        return s;
    };

    getMoons(): moonsState {
        let moons: moonsState = {
            jihae: '', jihaePos: "none", jihaeHeight: "none", jihaePhase: "none", jihaePhaseDirection: "waning",
            lirathu: '', lirathuPos: "none", lirathuHeight: "none", lirathuPhase: "none", lirathuPhaseDirection: "waning",
            blackmoon: '', blackmoonPos: "none", blackmoonHeight: "none"}
        const day = this.day + 1;
        const JIHAE_RISE = 2;
        const JIHAE_SET = 5;
        const LIRATHU_RISE = 3;
        const LIRATHU_SET = 8;
        const BLACKMOON_RISE = 7;
        const BLACKMOON_SET = 23;
        const jihaeCycle = this.day % 7;
        const lirathuCycle = this.day % 11;
        const blackmoonCycle = this.day % 33;


        if (jihaeCycle >= JIHAE_RISE && jihaeCycle <= JIHAE_SET) {
            if ((day > 48 && day < 52) || (day > 163 && day < 168)) { // new moon
                moons.jihae = "Almost imperceptible, the red moon";
                moons.jihaePhaseDirection = "neither"
                moons.jihaePhase = "new moon"
            } else if ((day > 51 && day < 65) || (day > 167 && day < 181)) { //  waxing, new crescent
                moons.jihae = "The thin, waxing crescent of the red moon";
                moons.jihaePhaseDirection = "waxing";
                moons.jihaePhase = "new crescent"
            } else if ((day > 64 && day < 78) || (day > 180 && day < 194)) { // waxing, crescent
                moons.jihae = "The thick, waxing crescent of the red moon";
                moons.jihaePhase = "crescent";
                moons.jihaePhaseDirection = "waxing";
            } else if ((day > 77 && day < 92) || (day > 193 && day < 208)) { // half-moon
                moons.jihae = "Half illuminated and waxing, the red moon";
                moons.jihaePhase = "half-moon";
                moons.jihaePhaseDirection = "waxing"
            } else if ((day > 123 && day < 138) || (day > 8 && day < 23)) {
                moons.jihae = "Half illuminated and waning, the red moon";
                moons.jihaePhase = "half-moon";
                moons.jihaePhaseDirection = "waning"
            } else if ((day > 91 && day < 106) || (day > 207 && day < 222)) { // waxing, gibbous
                moons.jihae = "The thick, waxing gibbous of the red moon";
                moons.jihaePhase = "gibbous";
                moons.jihaePhaseDirection = "waxing"
            } else if ((day > 105 && day < 110) || (day > 221 && day < 226)) { // full moon
                moons.jihae = "Bright and full, the red moon";
                moons.jihaePhase = "full";
                moons.jihaePhaseDirection = "neither"
            } else if ((day > 109 && day < 124) || (day > 225 && day < 232) || (day > 0 && day < 9)) { // waning, gibbous
                moons.jihae = "The thick, waning gibbous of the red moon";
                moons.jihaePhase = "gibbous";
                moons.jihaePhaseDirection = "waning"
            } else if ((day > 137 && day < 151) || (day > 22 && day < 36)) { // waning crescent
                moons.jihae = "The thick, waning crescent of the red moon";
                moons.jihaePhase = "crescent";
                moons.jihaePhaseDirection = "waning"
            } else if ((day > 150 && day < 164) || (day > 35 && day < 49)) { // waning, new crescent
                moons.jihae = "The thin, waning crescent of the red moon";
                moons.jihaePhase = "new crescent";
                moons.jihaePhaseDirection = "waning"
            }

            const pos = jihaeCycle < 4 ? "eastern" : "western";
            moons.jihaePos = jihaeCycle < 4 ? "east" : "west";

            if (jihaeCycle == JIHAE_RISE || jihaeCycle == JIHAE_SET) {
                moons.jihae += ` hangs low in the ${pos} sky`
                moons.jihaeHeight = "low"
            } else {
                moons.jihae += ` is high in the ${pos} sky`
                moons.jihaeHeight = "high"
            }
        }

        if (lirathuCycle >= LIRATHU_RISE && lirathuCycle <= LIRATHU_SET) {
            if ((day > 0 && day < 3) || (day > 229 && day < 232)) { // New Moon
                moons.lirathu = "Almost imperceptible, the white moon";
                moons.lirathuPhase = "new moon";
                moons.lirathuPhaseDirection = "neither";
            } else if (day > 2 && day < 31) { // waxing, new crescent
                moons.lirathu = "The thin, waxing crescent of the white moon";
                moons.lirathuPhase = "new crescent"
                moons.lirathuPhaseDirection =  "waxing"
            } else if (day > 30 && day < 60) { // waxing, crescent
                moons.lirathu = "The thick, waxing crescent of the white moon";
                moons.lirathuPhase = "crescent"
                moons.lirathuPhaseDirection = "waxing"
            } else if (day > 59 && day < 87) { // half-moon waxing
                moons.lirathu = "Half illuminated and waxing, the white moon";
                moons.lirathuPhase = "half-moon"
                moons.lirathuPhaseDirection = "waxing"
            } else if (day > 146 && day < 174) { // half-moon waning
                moons.lirathu = "Half illuminated and waning, the white moon";
                moons.lirathuPhase = "half-moon"
                moons.lirathuPhaseDirection = "waning"
            } else if (day > 86 && day < 115) { // waxing, gibbous
                moons.lirathu = "The thick, waxing gibbous of the white moon";
                moons.lirathuPhase = "gibbous"
                moons.lirathuPhaseDirection = "waxing"
            } else if (day > 114 && day < 119) { // full moon
                moons.lirathu = "Bright and full, the white moon";
                moons.lirathuPhase = "full"
                moons.lirathuPhaseDirection = "neither"
            } else if (day > 118 && day < 147) { // waning, gibbous
                moons.lirathu = "The thick, waning gibbous of the white moon";
                moons.lirathuPhase = "gibbous"
                moons.lirathuPhaseDirection = "waning"
            } else if (day > 173 && day < 202) { // waning crescent
                moons.lirathu = "The thick, waning crescent of the white moon";
                moons.lirathuPhase = "crescent"
                moons.lirathuPhaseDirection = "waning"
            } else if (day > 201 && day < 230) { // waning, new crescent
                moons.lirathu = "The thin, waning crescent of the white moon";
                moons.lirathuPhase = "new crescent"
                moons.lirathuPhaseDirection = "waning"
            }

            const pos = lirathuCycle < 6 ? "eastern" : "western";
            moons.lirathuPos = lirathuCycle < 6 ? "east" : "west";

            if (lirathuCycle == LIRATHU_RISE || lirathuCycle == LIRATHU_SET) {
                moons.lirathu += ` hangs low in the ${pos} sky`
                moons.lirathuHeight = "low"
            } else {
                moons.lirathu += ` is high in the ${pos} sky`
                moons.lirathuHeight = "high"
            }
        }

        if (blackmoonCycle >= BLACKMOON_RISE && blackmoonCycle <= BLACKMOON_SET) {
            let pos = "center of the";
            moons.blackmoonPos = "center"
            if (blackmoonCycle < 15) {
                pos = "eastern"
                moons.blackmoonPos = "east"
            } else if (blackmoonCycle > 15) {
                pos = "western"
                moons.blackmoonPos = "west"
            }

            if (blackmoonCycle == BLACKMOON_RISE || blackmoonCycle == BLACKMOON_SET) {
                if (this.hour !== 0 && this.hour !== 8) {
                    moons.blackmoon = `Hanging low in the ${pos} sky is the black moon`
                }
                moons.blackmoonHeight = "low"   
            } else {
                if (this.hour !== 0 && this.hour !== 8) {
                    moons.blackmoon = `High in the ${pos} sky is the black moon`
                }
                moons.blackmoonHeight = "high"
            }
        }


        return moons;
    }

    static buildRelativeString(previous: string, num: number, name: string): string {
        let result = previous;
        let separator = "";
        if (num > 0) {
            let numString = num.toString();
            if (result !== "") {
                separator += ", ";
            }
            let plural = "s";

            if (name === "hour") {
                numString = num.toFixed(1);
                if (numString.includes(".0")) {
                    numString = num.toFixed(0);
                }
                if (numString === "0") {
                    return result;
                }
            }

            if (numString === "1") {
                plural = "";
            }

            result += separator + numString + " " + name + plural;
        }
        return result;
    };

    static relativeTime(from: Date, to: Date): relativeZalanthanTime {
        let relativeTime: relativeZalanthanTime = {
            ages: 0,
            years: 0,
            months: 0,
            weeks: 0,
            days: 0,
            hours: 0,
            future: false,
            diff: 0
        };
        let timeDiff = Math.floor((to.getTime() - from.getTime()) / 1000);

        relativeTime.diff = timeDiff;
        relativeTime.future = timeDiff >= 0;
        timeDiff = Math.abs(timeDiff);

        let c = ZalanthanTime;
        relativeTime.hours = (timeDiff % c.dayToOOCSeconds) / c.hourToOOCSeconds;

        if (relativeTime.hours.toFixed(1) === "9.0") {
            relativeTime.hours = 0;
            timeDiff += c.dayToOOCSeconds;
        }

        timeDiff = Math.floor(timeDiff / c.dayToOOCSeconds);
        relativeTime.days = timeDiff % c.daysPerWeek;

        timeDiff = Math.floor(timeDiff / c.daysPerWeek);
        relativeTime.weeks = timeDiff % c.weeksPerMonth;

        timeDiff = Math.floor(timeDiff / c.weeksPerMonth);
        relativeTime.months = timeDiff % c.monthsPerYear;

        timeDiff = Math.floor(timeDiff / c.monthsPerYear);
        relativeTime.years = timeDiff % c.yearsPerAge;

        timeDiff = Math.floor(timeDiff / c.yearsPerAge);
        relativeTime.ages = timeDiff;
        return relativeTime;
    };

    static relativeString(relativeTime: relativeZalanthanTime): string {
        let r = relativeTime;
        if (Math.abs(r.diff) < 2) {
            return "That is now.";
        }

        if (r.diff < 60 && r.diff > 0) {
            return "That is a fraction of an hour away.";
        }

        if (r.diff > -60 && r.diff < 0) {
            return "That was a fraction of an hour ago.";
        }

        let diffString = ZalanthanTime.buildRelativeString("", r.ages, "age");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.years, "year");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.months, "month");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.weeks, "week");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.days, "day");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.hours, "hour");

        let prefix = r.future ? "That is " : "That was ";
        let suffix = r.future ? " from now." : " ago.";

        return prefix + diffString + suffix;
    };

    static differenceString(relativeTime: relativeZalanthanTime): string {
        let r = relativeTime;
        if (Math.abs(r.diff) < 2) {
            return "No time.";
        }

        if (Math.abs(r.diff) < 60) {
            return "A fraction of an hour.";
        }

        let diffString = ZalanthanTime.buildRelativeString("", r.ages, "age");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.years, "year");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.months, "month");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.weeks, "week");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.days, "day");
        diffString = ZalanthanTime.buildRelativeString(diffString, r.hours, "hour");

        return diffString;
    }

    static nextDawn(date: Date): Date {
        date.setMilliseconds(0);
        date.setSeconds(0);

        let mins = date.getMinutes();
        date.setMinutes(mins - (mins % 10));
        let icHour = ZalanthanTime.relativeTime(this.dawnOfTime, date).hours;
        let hoursTo = icHour === 1 ? 9 : (this.hoursPerDay + 1 - icHour) % this.hoursPerDay;
        return new Date(date.getTime() + hoursTo * this.hourToOOCSeconds * 1000);
    };

    static ICDateToOOC(dateString: string): (null | Date) {
        let filler = ["it", "is", "on", "of", "the", "in", "br", "s", "was", ""]
        let tokens = dateString.split(/\W+/).filter(function (token) {
            return !filler.includes(token.toLowerCase());
        });

        while (tokens.length > 13) {
            tokens[0] += " " + tokens[1];
            tokens.splice(1, 1);
        }

        if (tokens.length != 13) {
            return null;
        }

        let hour: number = NaN;
        for (let i = 0; i < ZalanthanTime.hoursInDay.length; i++) {
            if (ZalanthanTime.hoursInDay[i] == tokens[0]) {
                hour = i;
                break;
            }
        }
        let day: number = +tokens[2].substring(0, tokens[2].length - 2);
        tokens[2] = day.toString();
        let monthName = tokens[4] + " " + tokens[5];
        let month: number = NaN;
        for (let i = 0; i < ZalanthanTime.monthsInYear.length; i++) {
            if (ZalanthanTime.monthsInYear[i] == monthName) {
                month = i;
                break;
            }
        }

        let year = +tokens[10];
        let age = +tokens[11].substring(0, tokens[11].length - 2);
        if (Number.isNaN(hour) ||
            Number.isNaN(day) ||
            Number.isNaN(month) ||
            Number.isNaN(year) ||
            Number.isNaN(age)) {

            return null;
        }

        let time = (hour * this.hourToOOCSeconds) +
            ((day - 1) * this.dayToOOCSeconds) +
            (month * this.monthToOOCSeconds) +
            ((year - 1) * this.yearToOOCSeconds) +
            ((age - 1) * this.ageToOOCSeconds);
        time = time * 1000;

        let d = new Date(time + ZalanthanTime.dawnOfTime.getTime());
        return new Date(time + ZalanthanTime.dawnOfTime.getTime());
    }
}