import moment from 'moment'
import { getCurPowers, getSchool } from 'utils'
import { query } from 'services/lesson/list'

const initParams = {
  school: getSchool(),
  available: moment().startOf('month').format('X'),
  deadline: moment().add(1, 'month').startOf('month').format('X'),
}

function getCateIcon (lesson) {
  if (lesson.num_student === 0) {
    return 'e'
  } else if (lesson.num_student < lesson.category_upperlimit) {
    return 'h'
  }
  return 'o'
}

const renderList = (data) => {
  let lessons = []
  if (data[0] && data[0].list) {
    data[0].list.forEach((lesson) => {
      const start = moment.unix(lesson.available)
      const end = moment.unix(lesson.deadline)
      const item = {
        title: '',
        id: lesson.id,
        available: lesson.available,
        deadline: lesson.deadline,
        category_summary: lesson.category_summary,
        teacher_alternatename: lesson.teacher_alternatename,
        classroom: lesson.classroom,
        is_profession_vip: lesson.is_profession_vip,
        text: `${lesson.teacher_alternatename}(${lesson.classroom}${lesson.is_profession_vip ? ' V' : ''})`,
        start: new Date(start.year(), start.month(), start.date(), start.hour(), start.minute(), 0),
        end: new Date(end.year(), end.month(), end.date(), end.hour(), end.minute(), 0),
        category: lesson.category_idnumber.split('-')[0],
        iconType: getCateIcon(lesson),
      }
      lessons.push(item)
    })
  }
  return lessons
}

export default {
  namespace: 'lessonCalendar',
  state: {
    isPostBack: true, // 判断是否是首次加载页面，修复 + more bug
    clearDicMonth: false, // 是否需要清除dicMonth的标识符，搜索项改变时，需要清除dicMonth
    searchQuery: initParams,
    curDate: moment().format('X'),
    lessons: [],
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(({ pathname }) => {
        if (pathname === '/' || pathname === '/lesson/calendar') {
          const curPowers = getCurPowers('/lesson/calendar')
          if (curPowers) {
            dispatch({ type: 'app/changeCurPowers', payload: { curPowers } })
            dispatch({ type: 'querySearch' })
            dispatch({ type: 'query', payload: { isPostBack: true } })
          }
        }
      })
    },
  },
  effects: {
    * querySearch ({ }, { put }) {
      yield put({ type: 'commonModel/querySchools' })
      yield put({ type: 'commonModel/queryCategorys' })
      yield put({ type: 'commonModel/queryTeachers' })
    },
    * query ({ payload }, { select, call, put }) {
      const { searchQuery, curDate } = yield select(({ lessonCalendar }) => lessonCalendar)
      const { isPostBack, ...queryParams } = payload
      const querys = { ...searchQuery, ...queryParams }
      const { data, success } = yield call(query, querys)
      if (success) {
        yield put({
          type: 'querySuccess',
          payload: {
            lessons: renderList(data),
            isPostBack: false,
            curDate,
            searchQuery: querys,
          },
        })

        yield put({
          type: 'queryPrev',
          payload: {
            curDate,
            ...querys,
            available: moment.unix(querys.available).subtract(1, 'month').startOf('month').format('X'),
            deadline: moment.unix(querys.available).startOf('month').format('X'),
          },
        })
        yield put({
          type: 'queryNext',
          payload: {
            curDate,
            ...querys,
            available: querys.deadline,
            deadline: moment.unix(querys.deadline).add(1, 'months').startOf('month').format('X'),
          },
        })
      }
    },
    * queryPrev ({ payload }, { call, put }) {
      const { curDate, ...querys } = payload
      const { data, success } = yield call(query, querys)
      if (success) {
        yield put({
          type: 'queryPrevSuccess',
          payload: {
            available: querys.available,
            curDate,
            lessons: renderList(data),
          },
        })
      }
    },
    * queryNext ({ payload }, { call, put }) {
      const { curDate, ...querys } = payload
      const { data, success } = yield call(query, querys)
      if (success) {
        yield put({
          type: 'queryNextSuccess',
          payload: {
            deadline: querys.deadline,
            curDate,
            lessons: renderList(data),
          },
        })
      }
    },
    * reQuery ({ payload }, { select, put }) {
      const { searchQuery, curDate } = yield select(({ lessonCalendar }) => lessonCalendar)
      payload.available = moment.unix(curDate).startOf('month').format('X')
      payload.deadline = moment.unix(curDate).add(1, 'month').startOf('month').format('X')
      const querys = { ...searchQuery, ...payload }
      yield put({
        type: 'query',
        payload: querys,
      })
      yield put({
        type: 'resetDicMonth',
        payload: false,
      })
    },
  },
  reducers: {
    querySuccess (state, action) {
      const { lessons, isPostBack, searchQuery, curDate } = action.payload
      return { ...state, isPostBack, curDate, searchQuery, lessons }
    },
    queryPrevSuccess (state, action) {
      const { lessons, available, curDate } = action.payload
      return { ...state, curDate, lessons: [...state.lessons, ...lessons], searchQuery: { ...state.searchQuery, available } }
    },
    queryNextSuccess (state, action) {
      const { lessons, deadline, curDate } = action.payload
      return { ...state, curDate, lessons: [...state.lessons, ...lessons], searchQuery: { ...state.searchQuery, deadline } }
    },
    resetQuery (state) {
      const { curDate } = state
      const available = moment.unix(curDate).startOf('month').format('X')
      const deadline = moment.unix(curDate).add(1, 'month').startOf('month').format('X')
      return { ...state, searchQuery: { ...state.searchQuery, available, deadline } }
    },
    resetDicMonth (state, action) {
      return { ...state, clearDicMonth: action.payload }
    },
  },
}
