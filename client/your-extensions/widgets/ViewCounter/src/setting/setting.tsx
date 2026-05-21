import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
// import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components'

const Setting = (props: AllWidgetSettingProps<any>) => {

  return (
    <div className="widget-setting-demo">
      Is not necessary settings for this widget.
      {/* <MapWidgetSelector useMapWidgetIds={props.useMapWidgetIds} onSelect={onMapWidgetSelected} /> */}
    </div>
  )
}

export default Setting