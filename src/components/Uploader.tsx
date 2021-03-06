import { useStore } from '../store'
import { Button, message, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { observer, useLocalStore } from 'mobx-react'
import styled from 'styled-components'
import Loading from './Loading'
import { MutableRefObject, useEffect, useRef } from 'react'
import { handleCopy } from '../models'

const { Dragger } = Upload

const Result = styled.div`
  margin-top: 20px;
  border: 1px dashed #6ebcfc;
  background: #fafafa;
  padding: 20px;

  > h2 {
    text-align: center;
  }

  > dl {
    .filename {
      border: 1px solid #d9d9d9;
      width: 100%;
      padding: 4px;

      &:focus {
        outline: none;
      }
    }

    > dt {
      padding-bottom: 6px;
      font-weight: 600;
    }

    img {
      max-height: 280px;
      max-width: 100%;
      object-fit: contain;
    }

    .resize {
      > input {
        width: 100px;
        border: 1px solid #d9d9d9;
        padding: 4px;

        &:focus {
          outline: none;
        }
      }
    }
  }
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`

const Uploader = observer(() => {
  const { ImageStore } = useStore()
  const onlineUrlRef = useRef() as MutableRefObject<HTMLInputElement>
  const resizeUrlRef = useRef() as MutableRefObject<HTMLInputElement>
  const widthRef = useRef() as MutableRefObject<HTMLInputElement>
  const heightRef = useRef() as MutableRefObject<HTMLInputElement>

  const store = useLocalStore(() => ({
    width: '',
    setWidth() {
      store.width = widthRef.current.value
    },
    get widthStr() {
      return store.width ? `/w/${store.width}` : ''
    },
    height: '',
    setHeight() {
      store.height = heightRef.current.value
    },
    get heightStr() {
      return store.height ? `/h/${store.height}` : ''
    },
    get fullStr() {
      return (
        ImageStore.serverFile.attributes.url.attributes.url +
        '?imageView2/0' +
        store.widthStr +
        store.heightStr
      )
    },
  }))

  useEffect(() => {
    return () => ImageStore.resetServerFile()
  }, [])

  const props = {
    showUploadList: false,
    beforeUpload: (file: any) => {
      ImageStore.setFile(file)
      ImageStore.setFilename(file.name)

      if (!/(svg$)|(png$)|(jpg$)|(jpeg$)|(gif$)/gi.test(file.type)) {
        message.error('????????? png/svg/jpg/jpeg/gif ???????????????')
        return false
      }

      if (file.size > 2048 * 1024) {
        message.error('??????????????????2M')
        return false
      }

      ImageStore.upload()
        .then((file) => console.dir(file))
        .catch((err) => {
          console.error(err)
        })
      return false
    },
  }

  return (
    <>
      {ImageStore.isUploading ? (
        <>
          <Loading />
          <p
            style={{ textAlign: 'center', fontSize: '18px', color: '#40a9ff' }}
          >
            ???????????????...
          </p>
        </>
      ) : (
        <>
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">????????????????????????????????????</p>
            <p className="ant-upload-hint">
              ????????? png/svg/gif/jpg/jpeg ??????, ????????????2M
            </p>
          </Dragger>
        </>
      )}

      <div>
        {ImageStore.serverFile ? (
          <Result>
            <h2>????????????</h2>
            <dl>
              <dt>????????????</dt>
              <dd>
                <input
                  type="text"
                  className="filename"
                  value={ImageStore.serverFile.attributes.url.attributes.url}
                  ref={onlineUrlRef}
                  readOnly
                />
                <ButtonWrapper>
                  <Button
                    type="default"
                    size="small"
                    onClick={() => handleCopy(onlineUrlRef.current)}
                  >
                    ??????
                  </Button>
                  <Button type="default" size="small">
                    <a
                      target="_blank"
                      href={ImageStore.serverFile.attributes.url.attributes.url}
                      rel="noreferrer"
                    >
                      ??????
                    </a>
                  </Button>
                </ButtonWrapper>
              </dd>
              <dt>?????????</dt>
              <dd>
                <input
                  className="filename"
                  type="text"
                  value={ImageStore.filename}
                  readOnly
                />
              </dd>
              <dt>????????????</dt>
              <dd>
                <img
                  src={ImageStore.serverFile.attributes.url.attributes.url}
                  alt=""
                />
              </dd>
              <dt>???????????????</dt>
              <dd className="resize">
                <input
                  type="text"
                  placeholder=" ??????(??????)"
                  value={store.width}
                  ref={widthRef}
                  onChange={(e) => {
                    if (
                      e.target.value === '' ||
                      /^[1-9][0-9]*$/.test(e.target.value)
                    ) {
                      store.setWidth()
                    }
                  }}
                />{' '}
                -{' '}
                <input
                  type="text"
                  placeholder=" ??????(??????)"
                  ref={heightRef}
                  value={store.height}
                  onChange={(e) => {
                    if (
                      e.target.value === '' ||
                      /^[1-9][0-9]*$/.test(e.target.value)
                    ) {
                      store.setHeight()
                    }
                  }}
                />
              </dd>
              <dd>
                <input
                  type="text"
                  className="filename"
                  readOnly
                  ref={resizeUrlRef}
                  value={store.fullStr}
                />
                <ButtonWrapper>
                  <Button
                    type="default"
                    size="small"
                    onClick={() => {
                      handleCopy(resizeUrlRef.current)
                    }}
                  >
                    ??????
                  </Button>
                  <Button type="default" size="small">
                    <a target="_blank" href={store.fullStr} rel="noreferrer">
                      ??????
                    </a>
                  </Button>
                </ButtonWrapper>
              </dd>
            </dl>
          </Result>
        ) : (
          ''
        )}
      </div>
    </>
  )
})

export default Uploader
