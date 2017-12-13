import moment from 'moment'
import { getCurPowers, renderQuery, getSchool } from 'utils'
import { query as queryLessons } from 'services/lesson/list'

function getCateIcon (lesson) {
  if (lesson.num_student === 0) {
    return 'e'
  } else if (lesson.num_student < lesson.category_upperlimit) {
    return 'h'
  }
  return 'o'
}

export default {
  namespace: 'lessonCalendar',
  state: {
    isPostBack: true, // 判断是否是首次加载页面，修复 + more bug
    searchQuery: {},
    lessons: [],
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(({ pathname }) => {
        if (pathname === '/' || pathname === '/lesson/calendar') {
          const curPowers = getCurPowers('/lesson/calendar')
          if (curPowers) {
            dispatch({ type: 'app/changeCurPowers', payload: { curPowers } })
            dispatch({
              type: 'getLessons',
              payload: {
                school: getSchool(),
                available: moment().startOf('month').format('X'),
                deadline: moment().endOf('month').format('X'),
              },
            })
          }
        }
      })
    },
  },
  effects: {
    * getLessons ({ payload }, { select, call, put }) {
      const { searchQuery } = yield select(({ lessonCalendar }) => lessonCalendar)
      const querys = renderQuery(searchQuery, payload)
      console.log(moment.unix(querys.available).format('YYYY-MM-DD HH:mm:ss'))
      console.log(moment.unix(querys.deadline).format('YYYY-MM-DD HH:mm:ss'))
      const { data, success } = yield call(queryLessons, querys)
      let lessons = []
      if (data[0] && data[0].list) {
        lessons = data[0].list.map((lesson, index) => {
          const start = moment.unix(lesson.available)
          const end = moment.unix(lesson.deadline)
          lesson.title = `${lesson.teacher}(${lesson.classroom}${lesson.category.includes('-vip-') ? ' V' : ''})`
          lesson.start = new Date(start.year(), start.month(), start.date(), start.hour(), start.minute(), 0)
          lesson.end = new Date(end.year(), end.month(), end.date(), end.hour(), end.minute(), 0)
          lesson.category = lesson.category_idnumber.split('-')[0]
          lesson.iconType = getCateIcon(lesson)
          lesson.allDay = false
          lesson.index = index
          return lesson
        })
      }
      if (success) {
        yield put({
          type: 'getLessonsSuccess',
          payload: {
            searchQuery: querys,
            lessons,
            isPostBack: false,
          },
        })
      }
    },
  },
  reducers: {
    getLessonsSuccess (state, action) {
      return { ...state, ...action.payload }
    },
    changeView (state, action) {
      const { view } = action.payload
      return { ...state, view }
    },
  },
}
