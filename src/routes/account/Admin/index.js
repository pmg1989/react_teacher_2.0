import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { checkPower } from 'utils'
import { ADD, UPDATE, DETAIL, RESIGN, LEAVE, RESET_PASSWORD } from 'constants/options'
import List from './List'
import Search from './Search'
import ModalForm from './ModalForm'
import LevelModal from './LevelModal'

const namespace = 'accountAdmin'

function Admin ({ dispatch, curPowers, accountAdmin, modal, loading, commonModel, user }) {
  const addPower = checkPower(ADD, curPowers)
  const updatePower = checkPower(UPDATE, curPowers)
  const detailPower = checkPower(DETAIL, curPowers)
  const resignPower = checkPower(RESIGN, curPowers)
  const leavePower = checkPower(LEAVE, curPowers)
  const resetPasswordPower = checkPower(RESET_PASSWORD, curPowers)

  const searchProps = {
    user,
    searchQuery: accountAdmin.searchQuery,
    schools: commonModel.schools,
    addPower,
    onSearch (fieldsValue) {
      dispatch({
        type: `${namespace}/query`,
        payload: { current: 1, ...fieldsValue },
      })
    },
    onAdd () {
      dispatch({
        type: `${namespace}/showModal`,
        // school_id = 0 表示获取所有的classrooms，以作为校区下拉框筛选用
        payload: { type: 'create', curItem: { school_id: 0 } },
      })
    },
  }

  const listProps = {
    accountAdmin,
    schools: commonModel.schools,
    loading: loading.effects[`${namespace}/query`],
    updatePower,
    detailPower,
    resignPower,
    leavePower,
    resetPasswordPower,
    onPageChange (fieldsValue) {
      dispatch({
        type: `${namespace}/query`,
        payload: { ...fieldsValue, isPostBack: false },
      })
    },
    onEditItem (item) {
      dispatch({
        type: `${namespace}/showModal`,
        payload: { type: 'update', curItem: item },
      })
    },
    onDetailItem (item) {
      dispatch({
        type: `${namespace}/showModal`,
        payload: { type: 'detail', curItem: item },
      })
    },
    onResignItem (item) {
      dispatch({
        type: `${namespace}/toggleResign`,
        payload: { curItem: item },
      })
    },
    onLeaveItem (item) {
      if (item.teacher_status === 'normal') {
        dispatch({
          type: `${namespace}/showLeaveModal`,
          payload: { type: 'update', curItem: item },
        })
      } else {
        dispatch({
          type: `${namespace}/cancelLevelTeacher`,
          payload: { curItem: item },
        })
      }
    },
    onResetPasswordItem (params) {
      dispatch({
        type: `${namespace}/resetPassword`,
        payload: { params },
      })
    },
  }

  const modalProps = {
    schools: commonModel.schools,
    modal,
    loading: loading.models.accountAdmin,
    onOk (data) {
      dispatch({
        type: data.id
          ? `${namespace}/update`
          : `${namespace}/create`,
        payload: { curItem: data },
      })
    },
    onCancel () {
      dispatch({ type: 'modal/hideModal' })
    },
  }

  const levalModalProps = {
    modal,
    loading: loading.models.accountAdmin,
    onOk (data) {
      dispatch({
        type: `${namespace}/levelTeacher`,
        payload: {
          curItem: data,
        },
      })
    },
    onCancel () {
      dispatch({ type: 'modal/hideModal' })
    },
  }

  return (
    <div className="content-inner">
      <Search {...searchProps} />
      <List {...listProps} />
      {modal.visible && modal.id === 1 && <ModalForm {...modalProps} />}
      {modal.visible && modal.id === 2 && <LevelModal {...levalModalProps} />}
    </div>
  )
}

Admin.propTypes = {
  dispatch: PropTypes.func,
  curPowers: PropTypes.array,
  accountAdmin: PropTypes.object,
  modal: PropTypes.object,
  loading: PropTypes.object.isRequired,
  commonModel: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
}

function mapStateToProps ({ accountAdmin, modal, loading, commonModel, app }) {
  return { accountAdmin, modal, loading, commonModel, user: app.user }
}

export default connect(mapStateToProps)(Admin)
