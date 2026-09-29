import {type SchemaTypeDefinition} from 'sanity'

import {era} from './era'
import {room} from './room'
import {gameObject} from './gameObject'
import {clue} from './clue'
import {player} from './player'
import {temporalAction} from './temporalAction'
import {causalityLink} from './causalityLink'
import {paradox} from './paradox'
import {timelineState} from './timelineState'
import {gameSession} from './gameSession'
import {workflowTransition} from './workflowTransition'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    era,
    room,
    gameObject,
    clue,
    player,
    temporalAction,
    causalityLink,
    paradox,
    timelineState,
    gameSession,
    workflowTransition,
  ],
}
