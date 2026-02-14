import { useEffect, useRef } from 'react'
import { createPluginUI } from 'molstar/lib/mol-plugin-ui'
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18'
import 'molstar/lib/mol-plugin-ui/skin/light.scss';
import {StructureElement} from 'molstar/lib/mol-model/structure/structure'
import {compileIdListSelection} from 'molstar/lib/mol-script/util/id-list'
import type {PluginUIContext} from "molstar/lib/mol-plugin-ui/context";
import type {PredictionDetails} from './types.ts'
import {Modal} from "antd";

const MolstarViewer = ({details, onClose}: {details: PredictionDetails | null, onClose: () => void}) => {
    const parentRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
    const pluginRef = useRef<PluginUIContext>(null);

    useEffect(() => {
        async function init() {

            if(!details) {
                return
            }

            const plugin = await createPluginUI({
                target: parentRef.current,
                render: renderReact18
            });
            pluginRef.current = plugin;

            const [x, y, z] = details.predZnCoord

            const pdbIon = [
                'HETATM'.padEnd(6),
                ' 9999  ',
                'ZN'.padEnd(4),
                'ZN'.padEnd(4),
                'Z',
                '   1    ',
                String(x).padStart(8),
                String(y).padStart(8),
                String(z).padStart(8),
                '1.00'.padStart(6),
                '1.00'.padStart(6),
                ''.padEnd(10),
                'Zn'.padStart(2)
            ].join('')

            const url = `https://alphafold.ebi.ac.uk/files/${details.structureId}.pdb`
            const pdbRows = (await (await fetch(url)).text()).split('\n')
            const terIndex = pdbRows.findIndex(row => row.startsWith('TER'))
            pdbRows.splice(terIndex + 1, 0, pdbIon)
            const pdb = pdbRows.join('\n')

            const data = await plugin.builders.data.rawData({data: pdb, label: details.structureId})

            const trajectory = await plugin.builders.structure.parseTrajectory(data, 'pdb');
            await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');

            const query = compileIdListSelection('ZN', 'element-symbol')
            const loci = StructureElement.Loci.fromQuery(plugin.managers.structure.hierarchy.current.structures[0]!.cell.obj!.data, query)
            plugin.managers.structure.focus.setFromLoci(loci)
            plugin.managers.camera.focusLoci(loci)
        }

        init();

        return () => {
            pluginRef.current?.dispose()
        };
    }, [details]);

    return (
        <Modal
            open={!!details}
            title={details?.structureId}
            closable={{onClose, afterClose: () => pluginRef.current?.dispose()}}
            footer={null}
            width={840}
        >
            <div
                ref={parentRef}
                style={{ width: '100%', height: 800, position: 'relative'}}
            />
        </Modal>
    );
};

export default MolstarViewer;