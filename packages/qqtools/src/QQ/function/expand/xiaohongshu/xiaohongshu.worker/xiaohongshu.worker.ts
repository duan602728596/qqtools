import { setTimeout, clearTimeout } from 'node:timers';
import * as dayjs from 'dayjs';
import { QQProtocol } from '../../../../QQBotModals/ModalTypes';
import parser, { type ParserResult } from '../../../parser';
import * as CQ from '../../../parser/CQ';