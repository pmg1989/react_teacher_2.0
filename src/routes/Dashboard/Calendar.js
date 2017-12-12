import React from 'react'
import PropTypes from 'prop-types'
import BigCalendar from 'react-big-calendar'
import { Spin } from 'antd'
import { Link } from 'dva/router'
import moment from 'moment'
import classnames from 'classnames'
import 'react-big-calendar/lib/less/styles.less'
import styles from './Calendar.less'

moment.locale('zh_CN')
BigCalendar.momentLocalizer(moment) // or globalizeLocalizer

const MonthEvent = ({ event }) => {
  return (
    <Link to={`/lesson/detail/${event.id}`} className={styles.title_box}>
      <span className={`icon ${event.category}-${event.iconType}`} />
      <span className={styles.title}>{event.title}</span>
    </Link>
  )
}

MonthEvent.propTypes = {
  event: PropTypes.object.isRequired,
}

const AgendaEvent = ({ event }) => {
  return (
    <Link to={`/lesson/detail/${event.id}`} className={classnames(styles.title_box, styles.dark)}>
      <span className={`icon ${event.category}-${event.iconType}`} />
      <span className={styles.title}>{`${event.teacher} - ${event.category_summary} - ${event.classroom}教室`}</span>
    </Link>
  )
}

AgendaEvent.propTypes = {
  event: PropTypes.object.isRequired,
}

// const allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k])
const allViews = ['month', 'week', 'day', 'agenda']

const Calendar = ({ lessons, loading }) => {
  const handleSelectEvent = (event, e) => {
    console.log(event, e)
  }

  return (
    <Spin spinning={loading} size="large">
      {!loading &&
        <BigCalendar
          className={styles.calendar_box}
          events={lessons}
          views={allViews}
          step={30}
          defaultDate={new Date()}
          onSelectEvent={handleSelectEvent}
          components={{
            event: MonthEvent,
            agenda: {
              event: AgendaEvent,
            },
          }}
        />
      }
    </Spin>
  )
}

Calendar.propTypes = {
  lessons: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default Calendar
