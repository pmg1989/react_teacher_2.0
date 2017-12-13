import React from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col, Select } from 'antd'
import { getSchool } from 'utils'

const FormItem = Form.Item
const Option = Select.Option

let searchGroupProps = {}

const Search = ({
  searchQuery,
  schools,
  categorys,
  teachersDic,
  onSearch,
  form: {
    getFieldDecorator,
    validateFields,
  },
}) => {
  searchGroupProps = {
    onSearch () {
      validateFields((errors, values) => {
        if (errors) {
          return
        }
        onSearch(values)
      })
    },
  }
  console.log(searchQuery, teachersDic)
  return (
    <Row gutter={24}>
      <Col>
        <Form layout="inline">
          <FormItem label="校区" style={{ marginBottom: 20, marginRight: 40 }}>
            {getFieldDecorator('school', {
              initialValue: getSchool(),
            })(<Select style={{ width: 90 }} disabled={getSchool() !== 'global'}>
              <Option value="">全部</Option>
              {schools.map(item => <Option key={item.id} value={item.school}>{item.name}</Option>)}
            </Select>)
            }
          </FormItem>
          <FormItem label="老师" style={{ marginBottom: 20, marginRight: 40 }}>
            {getFieldDecorator('userid', {
              initialValue: '',
            })(<Select style={{ width: 90 }}>
              <Option value="">全部</Option>
              {categorys.map(item => <Option key={item.id} value={item.id.toString()}>{item.name}</Option>)}
            </Select>)
            }
          </FormItem>
          <FormItem label="科目" style={{ marginBottom: 20, marginRight: 40 }}>
            {getFieldDecorator('categoryid', {
              initialValue: searchQuery.categoryid || '',
            })(<Select style={{ width: 90 }}>
              <Option value="">全部</Option>
              {categorys.map(item => <Option key={item.id} value={item.id.toString()}>{item.name}</Option>)}
            </Select>)
            }
          </FormItem>
          <FormItem label="精品课/VIP课" style={{ marginBottom: 20, marginRight: 40 }}>
            {getFieldDecorator('category_ext', {
              initialValue: '',
            })(<Select style={{ width: 90 }}>
              <Option value="">全部</Option>
              <Option value="jp">精品课</Option>
              <Option value="vip">VIP课</Option>
            </Select>)
            }
          </FormItem>
        </Form>
      </Col>
    </Row>
  )
}

Search.propTypes = {
  form: PropTypes.object.isRequired,
  searchQuery: PropTypes.object.isRequired,
  schools: PropTypes.array.isRequired,
  categorys: PropTypes.array.isRequired,
  teachersDic: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
}

export default Form.create({
  onValuesChange () {
    setTimeout(() => {
      searchGroupProps.onSearch()
    }, 0)
  },
})(Search)
